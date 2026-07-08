import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Grid Hanoi: Spatial Leap",
  description:
    "Grid Hanoi: Spatial Leap — a bipartite-grid Hanoi puzzle prototype where disks leap over smaller neighbors to reach spatial targets. Play free in the browser.",
  openGraph: {
    title: "Grid Hanoi: Spatial Leap | ULSOME",
    url: "/games/grid-hanoi",
  },
};

export default function GridHanoiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
