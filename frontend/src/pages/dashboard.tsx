import { useEffect } from "react";

import { useAuth } from "../contexts/AuthContext";
import { api } from "../services/apiClient";
import { setupAPIClient } from "../services/api";
import { withSSRAuth } from "../utils/withSSRAuth";
import { Can } from "../components/Can";

export default function Dashboard() {
  const { user, signOut } = useAuth();

  useEffect(() => {
    api
      .get("me")
      .then(({ data }) => {
        console.log(data);
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h1>Hello {user?.email}!</h1>

      <button onClick={signOut}>Sair</button>

      <Can permissions={["metrics.list"]}>
        <div>Métricas</div>
      </Can>
    </div>
  );
}

export const getServerSideProps = withSSRAuth(async ctx => {
  const apiClient = setupAPIClient(ctx);

  const response = await apiClient.get("/me");

  console.log(response);

  return {
    props: {}
  };
});
