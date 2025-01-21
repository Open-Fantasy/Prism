import 'package:socket_io_client/socket_io_client.dart' show Socket, io;

const double NETWORK_DELAYED_PACKAGE_DROP = 5000.0;
const int EXCESSIVE_MESSAGE_QUEUE_SIZE = 100;

enum NetworkStatus {
  waitingForInitialization,
  initalizing,
  connectionError,
  connectionLost,
  connected,
  reconnecting,
  disconnected
}

abstract class NetworkMessage {
  final String verb;
  Object data;

  NetworkMessage(this.verb, this.data);
}

class Network {
  Socket? socket;
  NetworkStatus networkStatus = NetworkStatus.waitingForInitialization;
  List<NetworkMessage> messageQueue = [];
  List<NetworkMessage> priorityMessageQueue = [];

  bool start(String serverAddress) {
    if (networkStatus != NetworkStatus.waitingForInitialization) {
      print("Network already initialized");
      return false;
    }

    networkStatus = NetworkStatus.initalizing;

    socket = io(serverAddress, <String, dynamic>{
      'reconnection': false,
    });

    socket!.on('connect', (_) {
      networkStatus = NetworkStatus.connected;
      print("Connected to server");
    });

    socket!.on('connect_error', (_) {
      networkStatus = NetworkStatus.connectionError;
      print("Connection error");
    });

    socket!.on('disconnect', (_) {
      networkStatus = NetworkStatus.disconnected;
      print("Disconnected from server");
    });

    socket!.on('reconnecting', (_) {
      networkStatus = NetworkStatus.reconnecting;
      print("Reconnected to server");
    });

    return true;
  }

  void stop() {
    if (socket == null) {
      print("Network is already stopped or was never started.");
      return;
    }

    socket!.close();
    socket = null;
    networkStatus = NetworkStatus.waitingForInitialization;
    messageQueue.clear();
    priorityMessageQueue.clear();
  }

  void update(double dt) {
    if (socket == null || networkStatus != NetworkStatus.connected) {
      return;
    }

    if (messageQueue.isEmpty && priorityMessageQueue.isEmpty) {
      return;
    }

    if (dt > NETWORK_DELAYED_PACKAGE_DROP) {
      print("Network update too slow, dropping messages.");
      messageQueue.clear();
      priorityMessageQueue.clear();
      return;
    }

    if (messageQueue.length > EXCESSIVE_MESSAGE_QUEUE_SIZE) {
      print("Excessive message queue size, dropping messages.");
      messageQueue.clear();
      priorityMessageQueue.clear();
      return;
    }

    if (priorityMessageQueue.isNotEmpty) {
      NetworkMessage message = priorityMessageQueue.removeAt(0);
      socket!.emit(message.verb, message.data);
      return;
    }

    if (messageQueue.isNotEmpty) {
      NetworkMessage message = messageQueue.removeAt(0);
      socket!.emit(message.verb, message.data);
      return;
    }
  }

  bool publishMessage(NetworkMessage message, bool priority, bool immediate) {
    if (socket == null || networkStatus != NetworkStatus.connected) {
      print("Network not connected, message dropped.");
      return false;
    }

    if (immediate) {
      socket!.emit(message.verb, message.data);
      return true;
    }

    if (priority) {
      priorityMessageQueue.add(message);
    } else {
      messageQueue.add(message);
    }

    return true;
  }
}
