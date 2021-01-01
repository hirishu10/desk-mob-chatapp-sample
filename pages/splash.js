import Head from "next/head";
import { Spinner } from "react-bootstrap";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";
import { useRouter } from "next/router";
import style from "../styles/Components/Splash.module.scss";
import Image from "next/image";

function Splash() {
  const router = useRouter();
  const [user, loading] = useAuthState(auth);

  if (user) {
    const encodedURL = encodeURIComponent(auth?.currentUser?.email);
    router.replace(`/${encodedURL}`);
  }

  const bootstrapColors = [
    "primary",
    "secondary",
    "success",
    "danger",
    "warning",
    "info",
    "light",
    "dark",
  ];

  return (
    <div className={style.mainContainer}>
      <Head>
        <title>Loading.....</title>
        <link rel="icon" href="/rishufavicon.ico" />
      </Head>
      <div className={style.container}>
        {/* <ItemContainer> */}
        <Spinner
          animation="border"
          variant="primary"
          style={{
            marginRight: 5,
          }}
          size="sm"
        />
        <h1
          style={{
            paddingTop: 8,
            fontSize: 18,
          }}
        >
          Desk-Mob ChatApp
        </h1>
      </div>
      {/* </ItemContainer> */}
      <div className={style.footerContainer}>
        {/* <!-- Footer --> */}
        <div className={style.containerForLogo}>
          <div className={style.containerForLogoTitle}>from</div>
          <div className={style.containerForLogoImage}>
            <Image
              src={"/footerLogo/blackLogo.svg"}
              alt={"Rishu Chowdhary"}
              width={"40px"}
              height={"27px"}
              priority={true}
            />
            <span style={{ fontSize: "18px", color: "black" }}>Rishu</span>
          </div>
        </div>
        {/* <!-- Footer --> */}
      </div>
    </div>
  );
}

export default Splash;
