// import { Layout } from "antd";
// import { Content, Header } from "antd/es/layout/layout";
// import { ReactNode } from "react";
// import LogoUma from "@assets/logo-uma-texto-blanco.png";
// import Image from "next/image";

// export default function LayoutSecundario({
//   children,
// }: {
//   children: ReactNode;
// }) {
//   return (
//     <Layout>
//       <Header
//         className="z-1 flex justify-end items-center"
//         style={{ backgroundColor: "#ffffff", padding: 0 }}
//       >
//         <div
//           className="h-full w-[50px] bg-[#ec244f]"
//           style={{
//             clipPath: "polygon(0 100%, 100% 0, 100% 100%)",
//           }}
//         />
//         <div className="h-full w-[200px] bg-[#ec244f] flex items-center justify-center">
//           <Image src={LogoUma} alt="Logo UMA" height={50} />
//         </div>
//       </Header>
//       <Content className="">{children}</Content>
//     </Layout>
//   );
// }
