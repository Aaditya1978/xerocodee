import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { BarLoader } from "react-spinners";
import { Card, Container, Form, FloatingLabel, Button } from "react-bootstrap";
import Logo from "../../assets/logo.png";
import "./SelectType.scss";

export default function SelectType() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [type, setType] = useState(null);
  const [typeValue, setTypeValue] = useState("");
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
        `${import.meta.env.VITE_API_URL}/api/user/select_type`,
        {
          type: type,
          typeValue: typeValue,
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
    <div className="selectType">
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
              <p>Choose from the following</p>
            </div>
            <div className="s-btns">
              <Form.Check
                type="radio"
                label="Developer"
                name="type"
                id="developer"
                value="developer"
                onChange={(e) => setType(e.target.value)}
              />
              <Form.Check
                type="radio"
                label="Organisation"
                name="type"
                id="organisation"
                value="organisation"
                onChange={(e) => setType(e.target.value)}
              />
              <Form.Check
                type="radio"
                label="Company"
                name="type"
                id="company"
                value="company"
                onChange={(e) => setType(e.target.value)}
              />
            </div>

            {type && (
              <div className="s-form">
                <Form method="POST" onSubmit={handleSubmit}>
                  <FloatingLabel label={type + " name"} className="mb-3">
                    <Form.Control
                      type="text"
                      placeholder={type + " name"}
                      value={typeValue}
                      onChange={(e) => setTypeValue(e.target.value)}
                      required
                    />
                  </FloatingLabel>
                  {!formSubmitted ? (
                    <Button variant="primary" type="submit">
                      Submit
                    </Button>
                  ) : (
                    <Button variant="primary" type="submit" disabled>
                      Submitting...
                    </Button>
                  )}
                </Form>
              </div>
            )}
          </Container>
        </Card>
      )}
    </div>
  );
}
