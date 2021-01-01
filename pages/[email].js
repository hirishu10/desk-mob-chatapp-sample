import Head from "next/head";
import Sidebar from "../components/Sidebar";
import HomeScreen from "../components/HomeScreen";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import { useRouter } from "next/router";
import eStyle from "../styles/Email/Email.module.scss";

export default function Home({ friends }) {
  const { isDarkMode } = useSelector((state) => state.actionCombined);
  const router = useRouter();

  const iconColorConfig = {
    color: isDarkMode ? "white" : "#072130",
    bColor: isDarkMode ? "black" : "white",
    bColorForOptions: isDarkMode ? "#0c1118" : "white",
  };

  useEffect(() => {}, [router]);

  return (
    <div className={eStyle.container}>
      <Head>
        <title>Dashboard</title>
        <meta name="Dashboard" content="Dashboard" />
        <link rel="icon" href="/rishufavicon.ico" />
      </Head>
      <div
        className={eStyle.sidebarContainer}
        style={{
          backgroundColor: iconColorConfig?.bColorForOptions,
          borderRightColor: isDarkMode ? "#333943" : "whitesmoke",
        }}
      >
        <Sidebar friendList={friends} />
      </div>
      <div className={eStyle.static}>
        <HomeScreen />
      </div>
    </div>
  );
}

// This gets called on every request
export async function getServerSideProps(context) {
  let f = true;
  try {
    let decodedURL = decodeURIComponent(`${context?.query?.email}`);

    const res = await fetch(
      `${process?.env?.API_URL}/userData?id=${decodedURL}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await res.json();

    return {
      props: {
        friends: data,
      },
    };
  } catch (error) {
    console.log("Something went wrong", error);
    if (f) {
      alert("Error! \nPlease check your internet connection and try again");
      f = false;
    }
  }
}
