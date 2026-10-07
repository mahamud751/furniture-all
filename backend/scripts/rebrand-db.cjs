// One-off: rename ILLIYEEN / ILYN / SPACES content in the database to Savasaachi.
require("dotenv/config");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const rules = [
  [/ILLIYEEN/g, "Savasaachi"],
  [/(?:www\.)?ilyn\.global/g, "www.savasaachi.com"],
  [/, “ILYN”,/g, ","],
  [/ ILYN is a sub-brand of Savasaachi[^.]*\./g, ""],
  [/\n?<li[^>]*>ILYN (?:Facebook|Instagram) page:.*?<\/li>/g, ""],
  [/Savasaachi, ILYN, /g, "Savasaachi, "],
  [/Savasaachi, ILYN or/g, "Savasaachi or"],
  [/facebook\.com\/ILYNLifeStyle/g, "facebook.com/savasaachi"],
  [/instagram\.com\/ilynlifestyle/g, "instagram.com/savasaachi"],
  [/\bSPACES\b/g, "Savasaachi"],
];

const fix = (text) => rules.reduce((value, [pattern, repl]) => value.replace(pattern, repl), text);

async function main() {
  let changed = 0;

  for (const page of await prisma.page.findMany()) {
    const html = fix(page.html);
    if (html !== page.html) {
      await prisma.page.update({ where: { id: page.id }, data: { html } });
      changed++;
    }
  }

  for (const product of await prisma.product.findMany()) {
    const data = {};
    if (product.brand === "Spaces") data.brand = "Savasaachi";
    for (const key of ["description", "details"]) {
      const next = fix(product[key]);
      if (next !== product[key]) data[key] = next;
    }
    if (Object.keys(data).length) {
      await prisma.product.update({ where: { id: product.id }, data });
      changed++;
    }
  }

  const setting = await prisma.setting.findUnique({ where: { id: "default" } });
  if (setting) {
    await prisma.setting.update({
      where: { id: "default" },
      data: {
        email: setting.email.replace("support@ilyn.global", "support@savasaachi.com"),
        facebook: fix(setting.facebook),
        instagram: fix(setting.instagram),
      },
    });
    changed++;
  }

  const admin = await prisma.admin.findUnique({ where: { email: "admin@ilyn.local" } });
  if (admin) {
    await prisma.admin.update({ where: { id: admin.id }, data: { email: "admin@savasaachi.local" } });
    changed++;
  }

  console.log(`Rebranded ${changed} rows.`);
}

main().finally(() => prisma.$disconnect());
