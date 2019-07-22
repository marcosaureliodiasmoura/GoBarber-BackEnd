import Bee from 'bee-queue';
import CancellationMail from '../app/jobs/CancellationMail';
import redisConfig from '../config/redis';

const jobs = [CancellationMail]; // 1° Pra cada um desse job criamos uma fila dentro.

class Queue {
  constructor() {
    this.queues = {};

    this.init();
  }

  init() {
    jobs.forEach(({ key, handle }) => {
      this.queues[key] = {
        bee: new Bee(key, {
          // 2° Dentro dessa fila, armazenamos o Bee que é a nossa instancia que se conecta com o redis, onde posso armazenar e recuperar valores dentro do banco de dados.
          redis: redisConfig,
        }),
        handle, // 3° Respons. por processar a fila, recebe as variáveis do contexto do nosso e-mail, ou seja, os appointments e armazena dentro da fila (4°)
      };
    });
  }

  // 4. Armazena na fila (jobs)
  add(queue, job) {
    return this.queues[queue].bee.createJob(job).save();
  }

  // 6° Toda vez que eu tiver uma nova adição de dentro do redis (4)
  // O proccessQueue entra em ação (5) e processa o jobs em background em tempo real (7)

  // 5° vai pegar cada um desses jobs e vai ficar processando em tempo real.
  proccessQueue() {
    jobs.forEach(job => {
      const { bee, handle } = this.queues[job.key];

      bee.on('failed', this.handleFailure).process(handle); // 7° Processa o job em tempo real.
    });
  }

  handleFailure(job, err) {
    console.log(`Queue ${job.queue.name}: FAILED`, err);
  }
}

export default new Queue();
