import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { Card, Container, Form, FloatingLabel, Button } from "react-bootstrap";
import { BarLoader } from "react-spinners";
import Logo from "../../assets/logo.png";
import "./Home.scss";

export default function Home() {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const installation_id = searchParams.get("installation_id");

  const [user, setUser] = useState(null);
  const [type, setType] = useState(null);
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [repoData, setRepoData] = useState(null);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/user/verify`, {
        withCredentials: true,
      })
      .then((res) => {
        if (!res.data.user["type"]) {
          navigate("/select_type");
        }
        if (!res.data.user["hosting"]) {
          navigate("/select_hosting");
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
        `${import.meta.env.VITE_API_URL}/get_github_data`,
        {
          userName,
          installation_id,
        },
        {
          withCredentials: true,
        }
      )
      .then((res) => {
        setRepoData(res.data.data.data);
      })
      .then(() => {
        setFormSubmitted(false);
      })
      .catch((err) => {
        console.log(err);
        setFormSubmitted(false);
      });
  };

  return (
    <div className="home">
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
                label="AWS Cloud"
                name="type"
                id="aws"
                value="aws"
                onChange={(e) => setType(e.target.value)}
              />
              <Form.Check
                type="radio"
                label="Github"
                name="type"
                id="github"
                value="github"
                onClick={() => {
                  window.location.href = `https://github.com/apps/xerocodee-hosting`;
                }}
                onChange={(e) => setType(e.target.value)}
              />
            </div>

            {installation_id && (
              <div className="s-form">
                <Form method="POST" onSubmit={handleSubmit}>
                  <FloatingLabel label="Github UserName" className="mb-3">
                    <Form.Control
                      type="text"
                      placeholder="Github UserName"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
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

            {repoData && (
              <div className="s-repo">
                <h3>Repositories</h3>
                <ul>
                  {repoData.map((repo) => (
                    <li key={repo.id}>
                      <a href={repo.html_url} target="_blank" rel="noreferrer">
                        {repo.name}
                      </a>
                      { repo.private && <span className="private">Private</span> }
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Container>
        </Card>
      )}
    </div>
  );
}
