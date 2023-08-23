import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { BarLoader } from "react-spinners";
import { Card, Container, Form, Button } from "react-bootstrap";
import Logo from "../../assets/logo.png";
import "./SelectHosting.scss";

export default function SelectHosting() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [type, setType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formSubmitted, setFormSubmitted] = useState(false);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/user/verify`, {
        withCredentials: true,
      })
      .then((res) => {
        if (!res.data.user["type"]) {
          navigate("/select_type");
        }
        setUser(res.data.user);
      })
      .then(() => {
        setLoading(false);
      })
      .catch((err) => {
        navigate("/login");
      });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    axios
      .post(
        `${import.meta.env.VITE_API_URL}/api/user/select_hosting`,
        {
          type: type,
        },
        {
          withCredentials: true,
        }
      )
      .then((res) => {
        navigate("/");
      })
      .catch((err) => {
        alert(err.response.data.message);
      });
  };

  return (
    <div className="selectHosting">
      {loading ? (
        <div className="loading">
          <BarLoader color="#1F64FF" height={10} width={200} />
        </div>
      ) : (
        <Card className="s-card">
          <Container>
            <div className="s-logo">
              <img src={Logo} alt="logo" />
            </div>
            <div className="s-header">
              <h2>
                Welcome {user.firstName} {user.lastName} !
              </h2>
              <p>Choose from the following deployment options</p>
            </div>
            <div className="s-btns">
              <Form.Check
                type="radio"
                label="Self Hosting"
                name="type"
                id="self"
                value="self"
                onChange={(e) => setType(e.target.value)}
              />
              <Form.Check
                type="radio"
                label="Xerocodee Hosting"
                name="type"
                id="xerocodee"
                value="xerocodee"
                onChange={(e) => setType(e.target.value)}
              />
            </div>

            {type && (
              <div className="s-form">
                {!formSubmitted ? (
                  <Button onClick={handleSubmit}>Submit</Button>
                ) : (
                  <Button disabled>Submit</Button>
                )}
              </div>
            )}
          </Container>
        </Card>
      )}
    </div>
  );
}
