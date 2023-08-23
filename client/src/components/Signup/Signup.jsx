import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Card,
  Row,
  Col,
  Container,
  Form,
  FloatingLabel,
  Button,
} from "react-bootstrap";
import { FcGoogle } from "react-icons/fc";
import { ImGithub } from "react-icons/im";
import Logo from "../../assets/logo.png";
import signupImage from "../../assets/signupImage.png";
import "./Signup.scss";

export default function Signup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSignup = (e) => {
    e.preventDefault();
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setLoading(false);
      return alert("Passwords do not match");
    }

    axios
      .post(
        `${import.meta.env.VITE_API_URL}/api/user/signup`,
        {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
        },
        {
          withCredentials: true,
        }
      )
      .then((res) => {
        setLoading(false);
        navigate("/");
      })
      .catch((err) => {
        setLoading(false);
        alert(err.response.data.message);
      });
  };

  return (
    <div className="signup">
      <Card className="s-card">
        <Container className="s-cont">
          <Row className="s-row">
            <Col sm={12} md={7} className="s-left">
              <div className="s-logo">
                <img src={Logo} alt="logo" />
              </div>
              <div className="s-header">
                <h2>Hello!</h2>
                <p>Create Your Account</p>
              </div>
              <div className="s-form">
                <Form method="POST" onSubmit={handleSignup}>
                  <FloatingLabel label="First Name" className="mb-3">
                    <Form.Control
                      type="text"
                      placeholder="First Name"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      required
                    />
                  </FloatingLabel>
                  <FloatingLabel label="Last Name" className="mb-3">
                    <Form.Control
                      type="text"
                      placeholder="Last Name"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      required
                    />
                  </FloatingLabel>
                  <FloatingLabel label="Email Id" className="mb-3">
                    <Form.Control
                      type="email"
                      placeholder="Email Id"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                    />
                  </FloatingLabel>
                  <FloatingLabel label="Password" className="mb-3">
                    <Form.Control
                      type="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      required
                    />
                  </FloatingLabel>
                  <FloatingLabel label="Confirm Password" className="mb-3">
                    <Form.Control
                      type="password"
                      placeholder="Confirm Password"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          confirmPassword: e.target.value,
                        })
                      }
                      required
                    />
                  </FloatingLabel>
                  {!loading ? (
                    <Button className="s-btn" variant="primary" type="submit">
                      Sign Up
                    </Button>
                  ) : (
                    <Button
                      className="s-btn"
                      variant="primary"
                      type="submit"
                      disabled
                    >
                      Loading...
                    </Button>
                  )}
                </Form>

                <div className="s-social">
                  <p>OR</p>

                  <div className="s-social-btn">
                    <Button
                      className="s-btn"
                      variant="primary"
                      onClick={() => {
                        window.location.href = `${
                          import.meta.env.VITE_API_URL
                        }/auth/google`;
                      }}
                    >
                      <FcGoogle className="icon" /> Sign Up with Google
                    </Button>

                    <Button
                      className="s-btn"
                      variant="primary"
                      onClick={() => {
                        window.location.href = `${
                          import.meta.env.VITE_API_URL
                        }/auth/github`;
                      }}
                    >
                      <ImGithub className="icon" /> Sign Up with Github
                    </Button>
                  </div>
                </div>
              </div>

              <div className="s-footer">
                <p>
                  Already have an account? <Link to="/login">Login</Link>
                </p>
              </div>
            </Col>
            <Col md={5} className="s-right">
              <div className="s-image">
                <img src={signupImage} alt="signup" />
              </div>
              <div className="s-wave">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="538"
                  height="144"
                  viewBox="0 0 538 144"
                  fill="none"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M0 144L22.4167 125.913C44.8333 107.826 89.6667 71.6522 134.5 66.087C179.333 59.8261 224.167 84.1739 269 96C313.833 107.826 358.667 107.826 403.5 89.7391C448.333 71.6522 493.167 36.1739 515.583 18.087L538 0V144H515.583C493.167 144 448.333 144 403.5 144C358.667 144 313.833 144 269 144C224.167 144 179.333 144 134.5 144C89.6667 144 44.8333 144 22.4167 144H0Z"
                    fill="#1F64FF"
                  />
                </svg>
              </div>
            </Col>
          </Row>
        </Container>
      </Card>
    </div>
  );
}
