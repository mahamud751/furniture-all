// Rename Savasaachi branding in the database to Basha.
require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

const fix = (text) =>
  text
    .replace(/Savasaachi Furniture/g, "Basha Furniture")
    .replace(/Savasaachi/g, "Basha")
    .replace(/savasaachi/g, "basha")
    .replace(/SAVASAACHI/g, "BASHA");

async function main() {
  let changed = 0;

  for (const page of await prisma.page.findMany()) {
    const title = fix(page.title);
    const html = fix(page.html);
    if (title !== page.title || html !== page.html) {
      await prisma.page.update({ where: { id: page.id }, data: { title, html } });
      changed++;
    }
  }

  for (const product of await prisma.product.findMany()) {
    const data = {};
    if (product.brand && /savasaachi/i.test(product.brand)) data.brand = "Basha";
    for (const key of ["description", "details", "title"]) {
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
        email: fix(setting.email),
        facebook: fix(setting.facebook),
        instagram: fix(setting.instagram),
        promoBanner: fix(setting.promoBanner),
        hours: fix(setting.hours),
      },
    });
    changed++;
  }

  const oldAdmin = await prisma.admin.findUnique({ where: { email: "admin@savasaachi.local" } });
  if (oldAdmin) {
    await prisma.admin.update({ where: { id: oldAdmin.id }, data: { email: "admin@basha.local" } });
    changed++;
  }

  const email = (process.env.ADMIN_EMAIL ?? "admin@basha.local").toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "Admin@12345";
  const name = process.env.ADMIN_NAME ?? "Admin";
  await prisma.admin.upsert({
    where: { email },
    update: {},
    create: { email, name, password: await bcrypt.hash(password, 10) },
  });

  console.log(`Rebranded ${changed} rows. Admin: ${email}`);
}

main().finally(() => prisma.$disconnect());
