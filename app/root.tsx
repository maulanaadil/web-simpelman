import { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import {
  json,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRouteLoaderData,
} from "@remix-run/react";
import { useEffect } from "react";
import { toast as notify, Toaster } from "sonner";

import "@fontsource-variable/lexend-deca/wght.css";
import Widget from "./components/widget";
import "./tailwind.css";

import sonnerStyles from "~/styles/sonner.css?url";
import Progressbar from "./components/progressbar";
import { sessionStorage } from "./services/session.server";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: sonnerStyles },
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const session = await sessionStorage.getSession(
    request.headers.get("Cookie")
  );

  const user = session.get("user") || null;
  const toast = session.get("toast") || null;

  return json(
    { toast, user },
    {
      headers: {
        "Set-Cookie": await sessionStorage.commitSession(session),
      },
    }
  );
};

export function Layout({ children }: { children: React.ReactNode }) {
  const loaderData = useRouteLoaderData<typeof loader>("root");

  useEffect(() => {
    if (loaderData) {
      if (loaderData?.toast?.type === "error") {
        notify.error(loaderData?.toast.message, {
          closeButton: true,
        });
      }
      if (loaderData?.toast?.type === "success") {
        notify.success(loaderData?.toast.message, {
          closeButton: true,
        });
      }
      if (loaderData?.toast?.type === "info") {
        notify.info(loaderData?.toast.message, {
          closeButton: true,
        });
      }
      if (loaderData?.user) {
        localStorage.setItem("user", JSON.stringify(loaderData?.user));
      }
    }
  }, [loaderData, loaderData?.user]);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Progressbar />
        <Toaster richColors position="top-right" />
        {children}
        <Widget />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
