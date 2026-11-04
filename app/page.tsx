"use client";

import { useAuthenticator } from "@aws-amplify/ui-react";
import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import "./../app/app.css";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";

Amplify.configure(outputs);

const client = generateClient<Schema>();

export default function App() {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);    
  const { signOut } = useAuthenticator();
 
  function listTodos() {
    client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });
  }

  useEffect(() => {
    const subscription = client.models.Todo.observeQuery().subscribe({
    next: (data) => setTodos([...data.items]),
    error: (error) => {
      console.error("Todo 목록을 불러오지 못했습니다:", error);
    },
  });

  return () => subscription.unsubscribe();
}, []);

async function createTodo() {
  const content = window.prompt("Todo content");

  // 취소했거나 공백만 입력한 경우 생성하지 않습니다.
  if (content === null || !content.trim()) return;

  try {
    const { errors } = await client.models.Todo.create({
      content: content.trim(),
    });

    if (errors?.length) {
      throw new Error(errors.map((error) => error.message).join(", "));
    }
  } catch (error) {
    console.error("Todo 생성 실패:", error);
    window.alert("Todo를 만들지 못했습니다.");
  }
}

async function deleteTodo(id: string) {
  try {
    const { errors } = await client.models.Todo.delete({ id });

    if (errors?.length) {
      throw new Error(errors.map((error) => error.message).join(", "));
    }
  } catch (error) {
    console.error("Todo 삭제 실패:", error);
    window.alert("Todo를 삭제하지 못했습니다.");
  }
  }

  function createTodo() {
    client.models.Todo.create({
      content: window.prompt("Todo content"),
    });
  }

  function deleteTodo(id: string) {
    client.models.Todo.delete({ id });
  }

  return (
    <main>
      <h1>My todos </h1>
      <h1>{user?.signInDetails?.loginId}'s todos</h1>
      <button onClick={createTodo}>+ new</button>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id} className="todo-item">
            <span>{todo.content}</span>
            <button type="button" onClick={() => deleteTodo(todo.id)}>
              삭제
            </button>
          </li>
        ))}
      </ul>
      <div>
        🥳 App successfully hosted. Try creating a new todo.
        <br />
        <a href="https://docs.amplify.aws/nextjs/start/quickstart/nextjs-app-router-client-components/">
          Review next steps of this tutorial.
        </a>
      </div>
            <button onClick={signOut}>Sign out</button>
    </main>
  );
}
