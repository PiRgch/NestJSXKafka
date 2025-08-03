# Architecture Hexagonale avec DDD et Kafka - NestJS

## Vue d'ensemble de l'Architecture

Cette implémentation suit les principes de l'Architecture Hexagonale (Ports & Adapters) avec Domain-Driven Design (DDD) et intégration Kafka.

### Structure des Couches

```
src/order/
├── domain/                    # 🏛️ Couche Domaine (Cœur métier)
│   ├── entities/             # Entités et Agrégats
│   ├── value-objects/        # Objets de valeur
│   ├── repositories/         # Interfaces de repositories
│   └── events/              # Événements domaine
├── application/              # 🔄 Couche Application (Use Cases)
│   ├── use-cases/           # Cas d'usage métier
│   └── ports/               # Interfaces (Ports)
├── infrastructure/          # 🔧 Couche Infrastructure (Adapters)
│   ├── adapters/           # Implémentations concrètes
│   └── kafka/              # Configuration et handlers Kafka
└── interfaces/             # 🌐 Couche Interface (Controllers)
    ├── controllers/        # Points d'entrée HTTP
    └── dto/               # Objects de transfert de données
```

### Concepts DDD Implémentés

#### 1. **Value Objects**
- `OrderId`: Identifiant unique des commandes
- `Money`: Gestion des montants avec devise

#### 2. **Entities & Aggregates**
- `Order`: Agrégat racine gérant les commandes
- `AggregateRoot`: Classe de base pour la gestion d'événements

#### 3. **Domain Events**
- `OrderCreatedEvent`: Publié lors de la création d'une commande
- `DomainEvent`: Interface de base pour tous les événements

#### 4. **Repositories**
- `OrderRepository`: Interface pour la persistance des commandes

### Ports & Adapters

#### **Ports (Interfaces)**
- `EventPublisher`: Publication d'événements
- `Logger`: Logging applicatif
- `OrderRepository`: Persistance des données

#### **Adapters (Implémentations)**
- `KafkaEventPublisherAdapter`: Publication via Kafka
- `NestJSLoggerAdapter`: Logging via NestJS
- `InMemoryOrderRepositoryAdapter`: Stockage en mémoire

### Intégration Kafka

#### Configuration
- **Client ID**: `order-service`
- **Group ID**: `order-service-group`
- **Broker**: `localhost:9092`

#### Topics
- `order.events`: Événements génériques
- `order.created`: Création de commandes
- `order.confirmed`: Confirmation de commandes

## API Endpoints

### Créer une Commande
```http
POST /orders
Content-Type: application/json

{
  "customerId": "customer-123",
  "items": [
    {
      "productId": "product-456",
      "quantity": 2,
      "price": 29.99,
      "currency": "EUR"
    }
  ]
}
```

**Réponse:**
```json
{
  "orderId": "uuid-generated",
  "totalAmount": 59.98,
  "currency": "EUR"
}
```

### Récupérer une Commande
```http
GET /orders/{orderId}
```

**Réponse:**
```json
{
  "orderId": "uuid",
  "customerId": "customer-123",
  "status": "PENDING",
  "totalAmount": 59.98,
  "currency": "EUR",
  "items": [...],
  "createdAt": "2024-01-01T10:00:00Z"
}
```

## Événements Kafka

### OrderCreated Event
```json
{
  "eventName": "OrderCreated",
  "eventVersion": 1,
  "occurredOn": "2024-01-01T10:00:00Z",
  "data": {
    "orderId": "uuid",
    "customerId": "customer-123",
    "totalAmount": {
      "amount": 59.98,
      "currency": "EUR"
    },
    "items": [...]
  }
}
```

## Setup et Démarrage

### Prérequis
- Node.js 18+
- Docker (pour Kafka)

### Installation
```bash
npm install
```

### Démarrer Kafka (Docker)
```bash
# Docker Compose pour Kafka
docker run -d --name zookeeper -p 2181:2181 zookeeper:3.8
docker run -d --name kafka -p 9092:9092 \
  -e KAFKA_ZOOKEEPER_CONNECT=localhost:2181 \
  -e KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://localhost:9092 \
  -e KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1 \
  confluentinc/cp-kafka:latest
```

### Démarrer l'Application
```bash
npm run start:dev
```

## Tests

### Test de Création de Commande
```bash
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "test-customer",
    "items": [
      {
        "productId": "test-product",
        "quantity": 1,
        "price": 10.00
      }
    ]
  }'
```

### Test de Récupération
```bash
curl http://localhost:3000/orders/{orderId}
```

## Avantages de cette Architecture

### 🎯 **Séparation des Responsabilités**
- Domaine isolé des détails techniques
- Use cases réutilisables
- Infrastructure interchangeable

### 🔄 **Testabilité**
- Mocks faciles via les interfaces
- Tests unitaires du domaine sans dépendances
- Tests d'intégration ciblés

### 📈 **Scalabilité**
- Événements asynchrones via Kafka
- Architecture découplée
- Ajout facile de nouvelles fonctionnalités

### 🔧 **Maintenabilité**
- Code métier protégé
- Changements d'infrastructure sans impact
- Évolution indépendante des couches

## Prochaines Étapes

1. **Persistance** - Remplacer le repository en mémoire par PostgreSQL/MongoDB
2. **Authentification** - Ajouter JWT et autorisations
3. **Validation** - Étendre les règles métier
4. **Monitoring** - Ajouter métriques et health checks
5. **Tests** - Compléter la couverture de tests