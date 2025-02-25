import React, { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
/*
import {
  signInWithPassword,
  registerWithPassword,
  signInWithGoogle,
  signInWithGithub,
  getRedirectResultFromFirebase,
} from "../../firebase";*/
/* import { setCurrentUser } from "../../redux/userLogin"; */
import GoogleLogo from "/public/images/logos/google.png";
import GithubLogo from "/public/images/logos/github.png";
import ReCAPTCHA from "react-google-recaptcha";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "@/common/redux/hooks";
import Image from "next/image";
import {
  isSignedIn,
  registerViaEmailAndPassword,
  signInViaEmailAndPassword,
  signInViaGithubRedirect,
  signInViaGoogleRedirect,
} from "@/common/redux/userLogin";
import NavbarMain from "@/common/components/NavBarMain";
import Link from "next/link";
import Footer from "@/common/components/Footer";
import { SerializedError } from "@reduxjs/toolkit";
import { useRouter } from "next/router";
import CircularProgress from "@mui/material/CircularProgress";

const LoadingOverlay = () => {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: 9999,
        color: "#fff",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <CircularProgress color="primary" size={80} />
        <p style={{ marginTop: 10, fontSize: 16 }}>
          Loading... Please wait a moment
        </p>
      </div>
    </div>
  );
};

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [recaptcha, setRecaptcha] = useState<string | null>(null);
  const user = useAppSelector((state) => state.currentUser.user);
  const router = useRouter();
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (router.isReady && isSignedIn(user)) {
      router.replace({ pathname: "/dashboard" });
    }
  }, [user, router.isReady]);
  const Title = (
    <>
      <h1 className="title mb-5">
        No-code Solution for <br />
        Machine Learning
      </h1>
      <p className="description text-center mb-4">
        DLP is a playground where you can experiment with machine learning tools
        by inputting a dataset and use PyTorch modules without writing any code
      </p>
    </>
  );

  const SocialLogins = (
    <>
      <div className="d-flex justify-content-evenly mb-5">
        <Button
          className="login-button google"
          style={{
            position: "relative",
          }}
          onClick={async () => {
            setIsLoading(true);
            try {
              await dispatch(signInViaGoogleRedirect()).unwrap();
            } catch (e) {
              toast.error((e as SerializedError).message, {
                position: toast.POSITION.TOP_CENTER,
              });
            }
            setIsLoading(false);
          }}
        >
          <Image
            src={GoogleLogo}
            alt={"Sign In With Google"}
            fill={true}
            style={{ objectFit: "contain", margin: "auto" }}
          />
        </Button>
        <Button
          className="login-button github"
          style={{ position: "relative" }}
          onClick={async () => {
            setIsLoading(true);
            try {
              await dispatch(signInViaGithubRedirect()).unwrap();
            } catch (e) {
              toast.error((e as SerializedError).message, {
                position: toast.POSITION.TOP_CENTER,
              });
            }
            setIsLoading(false);
          }}
        >
          <Image
            src={GithubLogo}
            alt={"Sign In With Github"}
            fill={true}
            style={{ objectFit: "contain", margin: "auto" }}
          />
        </Button>
      </div>
    </>
  );

  const EmailPasswordInput = (
    <>
      {isRegistering && (
        <Form.Group className="mb-3" controlId="login-name">
          <Form.Label>Name</Form.Label>
          <Form.Control
            placeholder="Enter name"
            onBlur={(e) => setFullName(e.target.value)}
            autoComplete="name"
          />
        </Form.Group>
      )}

      <Form.Group className="mb-3" controlId="login-email">
        <Form.Label>Email address</Form.Label>
        <Form.Control
          type="email"
          placeholder="someone@example.com"
          onBlur={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
      </Form.Group>

      <Form.Group className="mb-5" controlId="login-password">
        <Form.Label>Password</Form.Label>
        <Form.Control
          type="password"
          placeholder="Password"
          onBlur={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
        {!isRegistering && (
          <div className="link">
            <Link href="/forgot">Forgot Password?</Link>
          </div>
        )}
      </Form.Group>
      {isRegistering && process.env.REACT_APP_CAPTCHA_SITE_KEY && (
        <div className="reCaptcha">
          <ReCAPTCHA
            sitekey={process.env.REACT_APP_CAPTCHA_SITE_KEY}
            theme="dark"
            onChange={(e) => setRecaptcha(e)}
          />
        </div>
      )}
      <div className="email-buttons d-flex flex-column">
        <Button
          id="log-in"
          className="mb-2"
          onClick={async () => {
            if (isRegistering) {
              setIsLoading(true);
              try {
                await dispatch(
                  registerViaEmailAndPassword({
                    email: email,
                    password: password,
                    displayName: fullName,
                    recaptcha: recaptcha,
                  })
                ).unwrap();
                toast.success(`Welcome ${fullName}`, {
                  position: toast.POSITION.TOP_CENTER,
                });
              } catch (e) {
                toast.error((e as SerializedError).message, {
                  position: toast.POSITION.TOP_CENTER,
                });
              }
              setIsLoading(false);
            } else {
              setIsLoading(true);
              try {
                await dispatch(
                  signInViaEmailAndPassword({ email, password })
                ).unwrap();
              } catch (e) {
                toast.error((e as SerializedError).message, {
                  position: toast.POSITION.TOP_CENTER,
                });
              }
              setIsLoading(false);
            }
          }}
        >
          {isRegistering ? "Register" : "Log in"}
        </Button>
        <Button
          variant="outline-dark"
          id="sign-up"
          onClick={() => setIsRegistering((e) => !e)}
        >
          {isRegistering ? "Log in" : "Register"}
        </Button>
      </div>
    </>
  );
  if (isLoading) {
    return (
      <>
        <NavbarMain />
        <LoadingOverlay /> {/* Display the loading overlay */}
      </>
    );
  }

  if (user !== undefined) {
    return <></>;
  }

  return (
    <>
      <NavbarMain />
      <div
        id="login-page"
        className="text-center d-flex justify-content-center"
      >
        <div className="main-container mt-5 mb-5">
          {Title}

          <Form className="form-container p-5">
            {SocialLogins}
            {EmailPasswordInput}
          </Form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Login;
