var techStackLogos = [
  {
    name: "Angular",
    img: "Images/TechStack-Logos/Angular-logo.png",
  },
  {
    name: "C",
    img: "Images/TechStack-Logos/C-logo.png",
  },
  {
    name: "CSharp",
    img: "Images/TechStack-Logos/CS-logo.png",
  },
  {
    name: "Python",
    img: "Images/TechStack-Logos/Python-Logo.png",
  },
  {
    name: "DataStructure",
    img: "Images/TechStack-Logos/DataStructure-logo.png",
  },
  {
    name: "Java",
    img: "Images/TechStack-Logos/Java-logo.png",
  },
  {
    name: "MySQL",
    img: "Images/TechStack-Logos/MySQL-logo.png",
  },
  {
    name: "React",
    img: "Images/TechStack-Logos/React-logo.png",
  },
  {
    name: "Vue",
    img: "Images/TechStack-Logos/Vue-logo.png",
  },
  {
    name: "Git",
    img: "Images/TechStack-Logos/Git-Logo.png",
  },
  {
    name: "SQL-Server",
    img: "Images/TechStack-Logos/SQL-Server-Logo.png",
  },
  {
    name: "SQLite",
    img: "Images/TechStack-Logos/SQLite-Logo.png",
  },
  {
    name: "PostgreSQL",
    img: "Images/TechStack-Logos/PostgreSQL-Logo.png",
  },
];

const techStacklogo = document.getElementById("TechStack-logo");
setInterval(setRandomImage, 1000);

function setRandomImage() {
  let index = Math.floor(Math.random() * techStackLogos.length);
  techStacklogo.setAttribute("src", techStackLogos[index].img);
}
