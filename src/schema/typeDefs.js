import { gql } from "apollo-server-express";

const typeDefs = gql`
  type Query {
    login(email: String!, password: String!): AuthData
    user(id: ID!): User
    users: [User]!
    product(id: ID!): Product
    products: [Product]!
  }

  type Mutation {
    signup(name: String!, email: String!, password: String!): User
    createProduct(
      description: String!
      price: Float!
      imageUrl: String!
    ): Product!
    updateProduct(
      id: ID!
      description: String
      price: Float
      imageUrl: String
    ): Product!
    addToCart(id: ID!): CartItem!
    deleteCart(id: ID!): CartItem!
  }

  scalar Date

  type User {
    id: ID!
    name: String!
    email: String!
    password: String!
    products: [Product]
    carts: [CartItem]!
    createdAt: Date!
  }

  type Product {
    id: ID!
    description: String!
    price: Float!
    imageUrl: String!
    user: User!
    createdAt: Date!
  }

  type CartItem {
    id: ID!
    product: Product!
    quantity: Int!
    user: User!
    createdAt: Date!
  }

  type AuthData {
    userId: ID
    jwt: String
  }
`;

export default typeDefs;
