const fs = require("fs");
const path = require("path");

const currentDir = process.cwd();

const ignoredFiles = fs
  .readFileSync(path.join(currentDir, ".gitattributes"), {
    encoding: "utf8",
    flag: "r",
  })
  .split("\n");

const generateHtmlList = (folderPath) => {
  try {
    const files = fs.readdirSync(folderPath);
    let htmlContent = ``;
    files.forEach((file) => {
      if (ignoredFiles.includes(file)) {
        return;
      }
      if (ignoredFiles.includes(`${file}/`)) return;
      const filePath = path.join(folderPath, file);
      htmlContent += `<li><a href="${file.replace(/\s/g, "%20")}${
        fs.statSync(filePath).isDirectory() ? "/" : ""
      }">${file}</a></li>\n`;
    });

    return htmlContent;
  } catch (error) {
    console.error("Error reading directory:", error);
    return "";
  }
};

const generateIndexHtml = (folderPath) => {
  const htmlList = generateHtmlList(folderPath);
  const outputPath = path.join(folderPath, "index.html");
  fs.writeFileSync(outputPath, htmlList);
};

const iterateDirectory = (startPath, relativePath = ".") => {
  if (!fs.existsSync(startPath)) {
    console.error("Directory does not exist:", startPath);
    return;
  }

  const files = fs.readdirSync(startPath);
  files.forEach((file) => {
    if (ignoredFiles.includes(file)) {
      return;
    }
    const filePath = path.join(startPath, file);
    const relativeFilePath = path.join(relativePath, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (
        ignoredFiles.includes(
          `${filePath.split("/")[filePath.split("/").length - 1]}/`
        )
      ) {
        return;
      }
      generateIndexHtml(filePath);
      iterateDirectory(filePath, relativeFilePath);
    }
  });
};

const main = async () => {
  generateIndexHtml(currentDir, ".");
  iterateDirectory(currentDir, ".");
};

main();
