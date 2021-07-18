import { FormEvent, useState } from "react";

import { withSSRGuest } from "../utils/withSSRGuest";

import { useAuth } from "../contexts/AuthContext";

import styles from "../styles/Home.module.css";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signIn } = useAuth();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    await signIn({ email, password });
  }

  return (
    <form onSubmit={handleSubmit} className={styles.container}>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <button type="submit">Entrar</button>
    </form>
  );
}

export const getServerSideProps = withSSRGuest(async () => {
  return {
    props: {}
  };
});
