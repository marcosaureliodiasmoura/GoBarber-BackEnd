import Notification from '../schemas/Notification';
import User from '../models/User';

class NotificationController {
  async index(req, res) {
    // Estou verificando se o usuário logado é um prestador de serviço.
    const checkIsProvider = await User.findOne({
      where: { id: req.userId, provider: true },
    });

    if (!checkIsProvider) {
      return res
        .status(400)
        .json({ error: 'Only provider can load notifications' });
    }

    // find do mongodb, irei buscar notificações do usuário logado.
    const notifications = await Notification.find({
      user: req.userId,
    })
      .sort({ createdAt: 'desc' })
      .limit(20);

    return res.json(notifications);
  }

  // Quando o usuário visualizar uma notificação não lida, ele passará como lida.
  async update(req, res) {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true }, // Atualiza como lido
      { new: true } // Retorna para o usuário
    );

    return res.json(notification);
  }
}

export default new NotificationController();
