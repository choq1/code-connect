import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcryptjs';
import { Comment } from '../posts/entities/comment.entity';
import { PostLike } from '../posts/entities/post-like.entity';
import { Post } from '../posts/entities/post.entity';
import { User } from '../users/entities/user.entity';
import dataSource from './data-source';

const SALT_ROUNDS = 10;

const SEED_USERS = [
  { name: 'Júlio Lima', email: 'julio@codeconnect.dev', username: 'julio' },
  { name: 'Márcia Souza', email: 'marcia@codeconnect.dev', username: 'marcia' },
  {
    name: 'Gabriel Luz',
    email: 'gabriel.luz@codeconnect.dev',
    username: 'gabriel_luz',
  },
  {
    name: 'Marcela Lins',
    email: 'marcela.lins@codeconnect.dev',
    username: 'marcela_lins',
  },
];

const CODE_SNIPPETS = [
  {
    language: 'javascript',
    code: `const pluckDeep = key => obj => key.split('.').reduce((accum, key) => accum[key], obj)

const compose = (...fns) => res => fns.reduce((accum, next) => next(accum), res)

const unfold = (f, seed) => {
  const go = (f, seed, acc) => {
    const res = f(seed)
    return res ? go(f, res[1], acc.concat([res[0]])) : acc
  }
  return go(f, seed, [])
}`,
  },
  {
    language: 'typescript',
    code: `type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E }

function tryCatch<T>(fn: () => T): Result<T> {
  try {
    return { ok: true, value: fn() }
  } catch (error) {
    return { ok: false, error: error as Error }
  }
}`,
  },
  {
    language: 'jsx',
    code: `function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timeout)
  }, [value, delay])

  return debounced
}`,
  },
  {
    language: 'css',
    code: `.card {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.5rem;
}

.card:focus-visible {
  outline: 2px solid var(--color-brand);
  outline-offset: 2px;
}`,
  },
  {
    language: 'python',
    code: `def quicksort(items):
    if len(items) <= 1:
        return items

    pivot = items[len(items) // 2]
    left = [x for x in items if x < pivot]
    middle = [x for x in items if x == pivot]
    right = [x for x in items if x > pivot]

    return quicksort(left) + middle + quicksort(right)`,
  },
  {
    language: 'sql',
    code: `SELECT p.title, count(l.id) AS likes
FROM posts p
LEFT JOIN post_likes l ON l."postId" = p.id
GROUP BY p.id
ORDER BY likes DESC
LIMIT 10;`,
  },
];

const TAG_POOL = [
  'React',
  'Front-end',
  'Acessibilidade',
  'TypeScript',
  'Node.js',
  'CSS',
  'Algoritmos',
  'Backend',
  'UI/UX',
  'Testes',
];

const POSTS = [
  {
    title: 'Compondo funções para pipelines de dados',
    description:
      'Um jeito simples de encadear transformações de dados sem precisar de bibliotecas externas, só compondo funções puras.',
  },
  {
    title: 'Um hook simples de debounce em React',
    description:
      'Depois de me cansar de copiar e colar a mesma lógica em vários componentes, criei esse hook reutilizável de debounce.',
  },
  {
    title: 'Type-safe error handling sem exceptions',
    description:
      'Uma abordagem inspirada em linguagens funcionais para tratar erros sem depender de try/catch em todo lugar.',
  },
  {
    title: 'Grid responsivo com poucas linhas de CSS',
    description:
      'Usando grid-template-columns com auto-fill e minmax pra criar um layout responsivo sem media query nenhuma.',
  },
  {
    title: 'Quicksort explicado com Python',
    description:
      'Uma implementação bem direta do quicksort, ótima pra revisar antes de entrevista técnica ou aula de estrutura de dados.',
  },
  {
    title: 'Rankeando posts com uma query SQL só',
    description:
      'Uma query que junta contagem de curtidas e ordenação em uma única consulta, sem precisar processar nada na aplicação.',
  },
  {
    title: 'Autenticação stateless com JWT na prática',
    description:
      'Como estruturei a autenticação da API sem guardar sessão no servidor, só validando o token em cada requisição.',
  },
  {
    title: 'Acessibilidade não é opcional: foco visível',
    description:
      'Um lembrete de que remover o outline do foco sem substituir por outra indicação visual prejudica quem navega pelo teclado.',
  },
  {
    title: 'Refatorando um formulário gigante em componentes',
    description:
      'Quebrei um formulário de mais de 300 linhas em componentes pequenos e reutilizáveis, sem quebrar nenhuma validação.',
  },
  {
    title: 'Testando hooks assíncronos sem gambiarra',
    description:
      'Um jeito limpo de testar hooks que fazem chamadas assíncronas, usando waitFor em vez de sleeps arbitrários.',
  },
  {
    title: 'Um padrão de repositório para TypeORM',
    description:
      'Organizando consultas complexas fora do service, num repositório customizado que fica mais fácil de testar.',
  },
  {
    title: 'Publicando sua primeira API REST',
    description:
      'Um guia rápido dos erros mais comuns que cometi na minha primeira API REST e como evitá-los.',
  },
];

const COMMENT_BODIES = [
  'Muito bom, aprendi bastante com esse post!',
  'Excelente explicação, ficou bem claro.',
  'Nunca tinha pensado nessa abordagem, valeu por compartilhar!',
  'Isso vai me ajudar muito no projeto que estou desenvolvendo.',
  'Parabéns pelo código, ficou bem organizado.',
  'Show de bola, exatamente o que eu precisava.',
  'Muito útil, salvei para consultar depois.',
  'Ótima dica, vou aplicar no meu projeto.',
  'Quanto tempo você levou para chegar nessa solução?',
  'Testei aqui e funcionou perfeitamente, obrigado!',
];

const REPLY_BODIES = [
  'Que bom que ajudou!',
  'Fico feliz que tenha gostado!',
  'Concordo plenamente.',
  'Verdade, faz total sentido.',
  'Exatamente, foi isso que pensei também.',
  'Levei uns três dias, mas valeu a pena.',
  'Faz sentido! Vou tentar aplicar isso também.',
];

function pickTags(): string[] {
  const count = faker.number.int({ min: 2, max: 4 });
  return faker.helpers.arrayElements(TAG_POOL, count);
}

async function seed() {
  await dataSource.initialize();

  const usersRepository = dataSource.getRepository(User);
  const postsRepository = dataSource.getRepository(Post);
  const commentsRepository = dataSource.getRepository(Comment);
  const likesRepository = dataSource.getRepository(PostLike);

  console.log('Limpando tabelas...');
  await dataSource.query(
    'TRUNCATE TABLE "post_likes", "comments", "posts", "users" CASCADE',
  );

  console.log('Criando usuários...');
  const passwordHash = await bcrypt.hash('senha123', SALT_ROUNDS);
  const users = await usersRepository.save(
    SEED_USERS.map((seedUser) =>
      usersRepository.create({
        ...seedUser,
        avatarUrl: `https://i.pravatar.cc/150?u=${seedUser.username}`,
        passwordHash,
      }),
    ),
  );

  console.log('Criando posts...');
  const posts = await postsRepository.save(
    POSTS.map(({ title, description }, index) => {
      const author = faker.helpers.arrayElement(users);
      const snippet = CODE_SNIPPETS[index % CODE_SNIPPETS.length];
      // ~1/3 dos posts fica sem thumbnail de propósito, para exercitar o
      // placeholder no front quando thumbnailUrl é nulo.
      const hasThumbnail = index % 3 !== 0;

      return postsRepository.create({
        title,
        description,
        code: snippet.code,
        language: snippet.language,
        tags: pickTags(),
        thumbnailUrl: hasThumbnail
          ? `https://picsum.photos/seed/code-connect-${index}/600/400`
          : null,
        authorId: author.id,
      });
    }),
  );

  console.log('Criando comentários e respostas...');
  for (const post of posts) {
    const commentCount = faker.number.int({ min: 0, max: 3 });

    for (let i = 0; i < commentCount; i += 1) {
      const commenter = faker.helpers.arrayElement(users);
      const comment = await commentsRepository.save(
        commentsRepository.create({
          body: faker.helpers.arrayElement(COMMENT_BODIES),
          postId: post.id,
          authorId: commenter.id,
        }),
      );

      if (faker.datatype.boolean({ probability: 0.4 })) {
        const replier = faker.helpers.arrayElement(
          users.filter((user) => user.id !== commenter.id),
        );
        await commentsRepository.save(
          commentsRepository.create({
            body: faker.helpers.arrayElement(REPLY_BODIES),
            postId: post.id,
            authorId: replier.id,
            parentId: comment.id,
          }),
        );
      }
    }
  }

  console.log('Criando curtidas...');
  for (const post of posts) {
    const likers = faker.helpers.arrayElements(
      users,
      faker.number.int({ min: 0, max: users.length }),
    );
    if (likers.length === 0) continue;

    await likesRepository.save(
      likers.map((user) =>
        likesRepository.create({ postId: post.id, userId: user.id }),
      ),
    );
  }

  console.log(
    `Seed concluído: ${users.length} usuários, ${posts.length} posts.`,
  );
  console.log('Login de teste: julio@codeconnect.dev / senha123');

  await dataSource.destroy();
}

seed().catch((error) => {
  console.error('Falha ao rodar o seed:', error);
  process.exit(1);
});
