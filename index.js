const fs = require("fs");
const readline = require("readline");
const crypto = require("crypto");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function convertImageToNumber(imagePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(imagePath, (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      const pixelString = data.toString("hex");
      const pixelNumber = BigInt(`0x${pixelString}`);
      resolve(pixelNumber);
    });
  });
}

function promptUser() {
  return new Promise((resolve) => {
    rl.question(
      "Enter the number of digits before the decimal: ",
      (digitsBefore) => {
        rl.question(
          "Enter the number of digits after the decimal: ",
          (digitsAfter) => {
            resolve({
              digitsBefore: parseInt(digitsBefore),
              digitsAfter: parseInt(digitsAfter),
            });
          },
        );
      },
    );
  });
}

function generateCryptoRandomNumber(pixelNumber, digitsBefore, digitsAfter) {
  const hash = crypto.createHash("sha256");
  hash.update(pixelNumber.toString());
  const hashedNumber = hash.digest();

  const numBytes = Math.ceil((digitsBefore + digitsAfter) / 2);
  const randomBytes = crypto.randomBytes(numBytes);

  const combinedBytes = Buffer.concat([hashedNumber, randomBytes]);
  const combinedString = combinedBytes.toString("hex");

  const decimalIndex = digitsBefore * 2;
  const integerPart = combinedString
    .slice(0, decimalIndex)
    .padStart(decimalIndex, "0");
  const decimalPart = combinedString
    .slice(decimalIndex, decimalIndex + digitsAfter * 2)
    .padEnd(digitsAfter * 2, "0");

  let integerValue = "";
  if (digitsBefore > 0) {
    integerValue = BigInt(`0x${integerPart}`).toString().slice(-digitsBefore);
  }

  let decimalValue = "";
  if (digitsAfter > 0) {
    decimalValue = BigInt(`0x${decimalPart}`)
      .toString()
      .padStart(digitsAfter, "0")
      .slice(0, digitsAfter);
  }

  let formattedNumber = "";
  if (digitsBefore > 0 && digitsAfter > 0) {
    formattedNumber = `${integerValue}.${decimalValue}`;
  } else if (digitsBefore > 0) {
    formattedNumber = integerValue;
  } else if (digitsAfter > 0) {
    formattedNumber = `0.${decimalValue}`;
  } else {
    formattedNumber = "0";
  }

  return formattedNumber;
}

// Usage example
const imagePath = "./random.jpg"; // Replace with the path to your image

convertImageToNumber(imagePath)
  .then((pixelNumber) => {
    return promptUser().then(({ digitsBefore, digitsAfter }) => {
      const cryptoRandomNumber = generateCryptoRandomNumber(
        pixelNumber,
        digitsBefore,
        digitsAfter,
      );
      console.log(
        "Cryptographically secure random number:",
        cryptoRandomNumber,
      );
      rl.close();
    });
  })
  .catch((error) => {
    console.error("Error converting image to number:", error);
    rl.close();
  });
