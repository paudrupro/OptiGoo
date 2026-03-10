export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { prisma } from '@/lib/prisma';

async function createTemplate(formData: FormData) {
  'use server';

  await prisma.messageTemplate.create({
    data: {
      name: String(formData.get('name')),
      type: String(formData.get('type')),
      subject: formData.get('subject') ? String(formData.get('subject')) : null,
      body: String(formData.get('body'))
    }
  });
}

export default async function TemplatesPage() {
  const templates = await prisma.messageTemplate.findMany({ orderBy: { updatedAt: 'desc' } });

  return (
    <div className="space-y-4">
      <form action={createTemplate} className="card grid gap-2">
        <h1 className="text-xl font-semibold">Bibliothèque de templates</h1>
        <input className="input" name="name" placeholder="Nom" />
        <select className="input" name="type" defaultValue="email">
          <option value="email">email</option>
          <option value="sms">sms</option>
        </select>
        <input className="input" name="subject" placeholder="Sujet (email)" />
        <textarea
          className="input min-h-32"
          name="body"
          placeholder="Utilisez {{nom_entreprise}}, {{ville}}, {{nb_avis}}, {{constat_1}}, {{constat_2}}"
        />
        <button className="btn">Ajouter</button>
      </form>

      <div className="card">
        <ul className="space-y-2 text-sm">
          {templates.map((template) => (
            <li key={template.id}>
              <strong>{template.name}</strong> ({template.type})
              {template.subject ? ` — ${template.subject}` : ''}
              <p>{template.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
