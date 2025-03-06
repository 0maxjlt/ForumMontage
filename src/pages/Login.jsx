
import { Fragment, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TextField } from '@mui/material';
import { Button } from '@mui/material';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Popup from "../components/Popup";
import MyBreadcrumbs from "../components/Breadcrumbs";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [popup, setPopup] = useState(null);
    const [color, setColor] = useState("primary");

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch("http://localhost:3001/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const result = await response.json(); // 🔥 Ici, on récupère bien un JSON

            if (result.success) {
                console.log(result.data);
                localStorage.setItem("user", JSON.stringify(result.data)); // 🔥 Stocke les données sous forme de JSON
                navigate("/dashboard");
            } else {
                setError("Email ou mot de passe incorrect");
                setColor("error");
                setPopup(true);
            }
        } catch (error) {
            console.error("Erreur lors de l'envoi :", error);
            setError("Une erreur est survenue");
        }
    };

    return (
        <>

            {popup != null && <Popup popup={popup} setPopup={setPopup} />}
            <div className="flex flex-col items-center justify-center min-h-screen center">

                <h1 className="text-2xl font-bold mb-4 center">Connexion</h1>
                <Stack
                    spacing={{ xs: 1, sm: 2 }}
                    direction="row"
                    useFlexGap
                    divider={<Divider orientation="vertical" flexItem />}
                    sx={{ flexWrap: 'wrap', justifyContent: 'center' }}
                >
                    <TextField id="email" label="email" color={color} focused className="w-full border p-2 mb-2" value={email}
                        onChange={(e) => setEmail(e.target.value)} />
                    <TextField id="mdp" label="mot de passe" color={color} focused type="password" className="w-full border p-2 mb-2" value={password}
                        onChange={(e) => setPassword(e.target.value)} />

                    <Button id="submit" variant="outlined" onClick={handleSubmit} disabled={email.length == 0 || password.length == 0} className="bg-blue-500 text-white px-4 py-2 w-full rounded">Se connecter</Button>
                </Stack>
            </div>
        </>
    );

}

export default Login;
