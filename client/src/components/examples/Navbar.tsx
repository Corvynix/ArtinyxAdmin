import Navbar from "../Navbar";

export default function NavbarExample() {
  return <Navbar currentLang="en" onLanguageChange={(lang) => console.log("Language changed to:", lang)} />;
}
