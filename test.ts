import { createCanvas } from "canvas";
import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";

// fix __dirname, __filename cho ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function hasVietnameseChar(word: string): boolean {
  return /[àáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ]/i.test(
    word
  );
}

function maskWord(word: string): string {
  if (hasVietnameseChar(word)) return word;
  if (word.length <= 1) return word;

  // nếu từ quá ngắn thì chỉ che 1 ký tự
  if (word.length <= 3) {
    const idx = Math.floor(Math.random() * word.length);
    return word
      .split("")
      .map((ch, i) => (i === idx ? "_" : ch))
      .join("");
  }

  // số lượng ký tự che: từ 50% đến 70% độ dài
  const minMask = Math.ceil(word.length * 0.5);
  const maxMask = Math.ceil(word.length * 0.7);
  const numMask = Math.min(
    Math.floor(Math.random() * (maxMask - minMask + 1)) + minMask,
    word.length - 1 // tránh che hết
  );

  let indices: number[] = [];
  while (indices.length < numMask) {
    const r = Math.floor(Math.random() * word.length);
    // không trùng, không liền kề
    if (
      !indices.includes(r) &&
      !indices.includes(r - 1) &&
      !indices.includes(r + 1)
    ) {
      indices.push(r);
    }
  }

  return word
    .split("")
    .map((ch, i) => (indices.includes(i) ? "_" : ch))
    .join("");
}

function maskText(input: string): string {
  const words = input.split(" ");
  const totalChars = words.join("").length;

  // số lượng ký tự cần che (30-50%)
  const minMask = Math.ceil(totalChars * 0.3);
  const maxMask = Math.ceil(totalChars * 0.5);
  const numMask =
    Math.floor(Math.random() * (maxMask - minMask + 1)) + minMask;

  // danh sách các vị trí {wi, ci}
  let positions: { wi: number; ci: number }[] = [];
  words.forEach((w, wi) => {
    w.split("").forEach((_, ci) => {
      positions.push({ wi, ci });
    });
  });

  let chosen: { wi: number; ci: number }[] = [];
  while (chosen.length < numMask && positions.length > 0) {
    const r = Math.floor(Math.random() * positions.length);
    const pos = positions[r];

    // rule: không che trùng và không liền kề trong cùng một từ
    if (
      !chosen.some(
        (p) => p.wi === pos.wi && Math.abs(p.ci - pos.ci) <= 1
      )
    ) {
      chosen.push(pos);
    }
    positions.splice(r, 1);
  }

  // đảm bảo mỗi từ ít nhất bị che 1 ký tự
  words.forEach((w, wi) => {
    if (!chosen.some((p) => p.wi === wi)) {
      const idx = Math.floor(Math.random() * w.length);
      chosen.push({ wi, ci: idx });
    }
  });

  // tạo kết quả
  const maskedWords = words.map((w, wi) => {
    return w
      .split("")
      .map((ch, ci) =>
        chosen.some((p) => p.wi === wi && p.ci === ci) ? "_" : ch
      )
      .join("");
  });

  return maskedWords.join(" ");
}



async function generateImage(text: string, answer: string, outPath: string) {
  const width = 600;
  const height = 400;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // nền đen
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, width, height);

  // chữ chính
  ctx.fillStyle = "white";
  ctx.font = "48px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, width / 2, height / 2 - 30);

  // đáp án nhỏ phía dưới
  ctx.font = "28px Arial";
  ctx.fillText(answer, width / 2, height - 60);

  const buffer = canvas.toBuffer("image/png");
  fs.writeFileSync(outPath, buffer);
}

async function main() {
const phrases = [
  "Xin chào bạn",
  "Hẹn gặp lại",
  "Chúc bạn một ngày tốt lành",
  "Tôi đang học lập trình",
  "Trời hôm nay thật đẹp",
  "Bạn có khỏe không",
  "Chúng ta cùng đi ăn trưa",
  "Cuộc sống là những chuyến đi",
  "Gia đình là số một",
  "Thành công đến từ nỗ lực",
  "Cà phê sữa đá buổi sáng",
  "Hạnh phúc giản đơn",
  "Thời gian quý hơn vàng",
  "Tình bạn mãi mãi",
  "Ước mơ không bao giờ tắt",
  "Sách là kho tàng tri thức",
  "Mỗi ngày một niềm vui",
  "Nụ cười tỏa nắng",
  "Học tập suốt đời",
  "Vượt qua thử thách"
];
  const outDir = path.join(__dirname, "output");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

  for (const phrase of phrases) {
    const masked = maskText(phrase);
    const filename = phrase.replace(/\s+/g, "_") + ".png";
    const outPath = path.join(outDir, filename);
    await generateImage(masked, phrase, outPath);
    console.log("Generated:", outPath);
  }
}

main();
