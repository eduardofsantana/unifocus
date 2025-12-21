# 🎓 UniFocus

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-0EA5E9?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

---

## 📚 Sobre o Projeto

**UniFocus** é um gerenciador acadêmico voltado para estudantes universitários que precisam organizar notas, faltas e cursos complementares de forma simples e visual.  
O objetivo é reduzir a ansiedade em torno de provas finais e médias, eliminando a necessidade de planilhas complexas e cálculos manuais.

O sistema centraliza em um só lugar: controle de disciplinas por período, cálculo de médias ponderadas, acompanhamento de faltas e gestão de cursos extracurriculares.

---

## 🤖 Como isso foi construído

Este projeto foi desenvolvido em um processo altamente iterativo, utilizando intensivamente ferramentas de IA para acelerar a prototipagem e explorar diferentes soluções de forma rápida.  
A cada etapa, o código gerado era analisado, adaptado ao contexto do projeto e refinado manualmente para garantir legibilidade, segurança e aderência às necessidades reais.

A abordagem seguiu um ciclo simples:

1. Definir claramente a necessidade (por exemplo, separar notas por unidade ou ajustar regras de cálculo).  
2. Utilizar a IA como apoio para gerar uma proposta de solução.  
3. Revisar, ajustar e integrar o código ao projeto, testando o comportamento na prática.  
4. Repetir o ciclo, melhorando tanto a base de código quanto a experiência do usuário.

Esse fluxo permitiu validar ideias rapidamente, mantendo o foco em entregar valor ao usuário final, ao mesmo tempo em que fortaleceu habilidades de análise crítica de código, arquitetura prática e tomada de decisão técnica.

---

## 🛠 Stack Tecnológico

A escolha das tecnologias priorizou **velocidade**, **performance** e **simplicidade** para desenvolvimento e deploy:

- **Frontend:** React + Vite  
- **Estilização:** Tailwind CSS  
- **Ícones:** Lucide React  
- **Backend & Banco de Dados:** Supabase (autenticação, banco PostgreSQL e recursos em tempo real)  
- **Hospedagem:** Vercel (deploy rápido e integrado com Git)

---

## ✨ Funcionalidades

Principais funcionalidades do **UniFocus**:

- **Gestão por Períodos:** Organização das matérias por semestre/período (1º, 2º, 3º, etc.).  
- **Cálculo de Notas:** Separação automática por unidades (ex.: Unidade 1 e Unidade 2) com cálculo de média ponderada.  
- **Controle de Faltas:** Botões para adicionar/remover faltas, com alertas visuais ao se aproximar do limite permitido.  
- **Feed de Turmas:** Mural onde alunos da mesma turma podem postar avisos e dúvidas usando um código de convite.  
- **Currículo Extra:** Área para gerenciar cursos complementares (Udemy, Alura, etc.) com barra de progresso gamificada.  
- **Autenticação e Segurança:** Login, cadastro, recuperação de acesso (por exemplo, via link mágico) e proteção de dados usando regras de segurança no banco (RLS).

---

## 🚀 Como Rodar Localmente

Para rodar o projeto na sua máquina:

1. **Clone o repositório**
   ```bash
   git clone https://github.com/eduardofsantana/unifocus.git
   cd unifocus
2. **Instale as dependências**
   ```bash
   npm install
3. **Configure o Supabase**

    Crie um projeto no Supabase. 

    Crie um arquivo .env na raiz do projeto e adicione:

    ```bash
    VITE_SUPABASE_URL=sua_url_aqui
    VITE_SUPABASE_ANON_KEY=sua_chave_aqui

4. **Crie as tabelas necessárias**

    Execute os scripts SQL para criar as tabelas:

    profiles

    subjects

    grades

    classrooms

    classroom_members

    classroom_posts

    certifications

5. Inicie o servidor de desenvolvimento
    ```bash
    npm run dev


📝 Considerações Finais

O UniFocus demonstra como é possível combinar ferramentas modernas de desenvolvimento web com IA para acelerar o ciclo de construção de software sem abrir mão de qualidade.
O projeto foi pensado para resolver um problema real do dia a dia acadêmico, ao mesmo tempo em que serve como vitrine de aprendizado prático em frontend, backend e integração com serviços em nuvem.

Desenvolvido por Eduardo Felipe, com apoio de ferramentas de Inteligência Artificial no processo de ideação e desenvolvimento.

