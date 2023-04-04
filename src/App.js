import "./App.css";
import GetSiteDataForm from "./Form/GetSiteDataForm";
import { Container, Typography } from "@mui/material";

function App() {
  return (
    <div className="App">
      <Container maxWidth="md" sx={{ mt: 5 }}>
        <Typography align="center" variant="h3">
          Get URL Data
        </Typography>
        <GetSiteDataForm />
      </Container>
    </div>
  );
}

export default App;
