## Road to AI: documentation site

<div align="center">
<img src="public/assets/images/thumbnail-3.png" alt="Thumbnail" width="80%">
</div>

**Live site: [docs.muhammedshah.com](https://docs.muhammedshah.com)**

### 🎯About This Site
This platform serves as a structured documentation hub for my journey in understanding and implementing artificial intelligence and machine learning concepts, with a primary focus on building a GPT model. The content is heavily based on [Andrej Karpathy](https://karpathy.ai)'s Neural Networks: Zero to Hero series and aims to provide well-organized insights, implementations, and notes for anyone following a similar path.

This site is designed for:

- Learners and developers interested in AI and deep learning.

- Anyone following Karpathy's Zero to Hero series.

- The open-source community looking for structured references and implementations.

&nbsp;

### 🗃️Documentation structure
The site has two sections: **Neural Networks** (the Zero to Hero series) and the **Library** (notes from AI/ML books, starting with *AI Engineering* by Chip Huyen).

The Neural Networks lectures are grouped into two sets: **Set-1** and **Set-2**.

**Set-1: Language Modeling Framework**

|Path | Implementation of | Link |
|------|--------|------|
|Backpropagation|Micrograd|[Video Lecture](https://youtu.be/PaCmpygFfXo?si=YW_rkr7LU44YwouD)|
|Language Model-1|Makemore (Part 1)|[Video Lecture](https://youtu.be/PaCmpygFfXo?si=mJ8mN4QhPB997R0p)|
|Language Model-2|Makemore (Part 2)|[Video Lecture](https://youtu.be/TCH_1BHY58I?si=jvfgiqzLoRVSgj8u)|
|Language Model-3|Makemore (Part 3)|[Video Lecture](https://youtu.be/P6sfmUTpUmc?si=6072SkRZSdY1pPB2)|
|Language Model-4|Makemore (Part 4)|[Video Lecture](https://youtu.be/q8SA3rM6ckI?si=e-ON-yHPUtFWzY2L)|
|Language Model-5|Makemore (Part 5)|[Video Lecture](https://youtu.be/t3YJ5hKiMQ0?si=kPSjBl8rkxMlQEhv)|

**Set-2: Transformer Neural Networks**

|Path | Implementation of | Link |
|------|--------|------|
|Transformer Model-1 (GPT)|Build GPT|[Video Lecture](https://youtu.be/kCc8FmEb1nY?si=hMmmnADUeWywJ8qt)|
|Tokenizers|Build GPT Tokenizer|[Video Lecture](https://youtu.be/zduSFxRajkE?si=o3BdcoWkvDjr7Ddl)|
|Transformer Model-2 (GPT)|Reproducing GPT-2|[Video Lecture](https://youtu.be/l8pRSuU81PU?si=YMklSfDxPVCP05p5)|

&nbsp;

### 🛠️Built with

- [Next.js](https://nextjs.org) 16 (App Router), exported as a fully static site
- [Fumadocs](https://fumadocs.dev) for the docs layout, MDX and the static [Orama](https://orama.com) search
- Tailwind CSS 4, TypeScript and [Biome](https://biomejs.dev)
- Jupyter notebooks are converted to pages from their saved outputs (they are never executed)

### 💻Running it locally

Requires Node.js 22 or newer (`.nvmrc` pins 24).

```bash
npm ci                    # install the exact versions from package-lock.json
npm run dev               # http://localhost:3000
npm run build             # static export into out/
npx serve out -l 4173     # preview the export
```

Checks: `npm run typecheck && npm run lint && npm run build && npm run check:links && npm run check:parity`.

Where things live:

- `content/docs/`: the pages (MDX) and the sidebar order (`meta.json`)
- `notebooks/`: the executed notebooks; `npm run notebooks` turns them into pages
- `public/assets/images/`: images used by the pages

&nbsp;

### ❗Reflections and Usage Guidelines

> [!NOTE]  
> - This repository is a personal knowledge base for revision, experimentation, and sharing insights.  
> - If you find it useful, or spot any errors or improvements, feel free to reach out.  
> - You are welcome to reference this material for your own learning journey!


> [!WARNING]
> This content is based on open-source educational materials (Thanks to Andrej Karpathy). While you are encouraged to learn from and contribute to this resource, please do not copy or repurpose it for commercial use. Respect the effort behind this work, and let's continue fostering an open and ethical AI learning community!

&nbsp;

<div align="center">
<img src="public/assets/images/main-page-logo-1.png" alt="Road to AI" width="50%">
</div>
