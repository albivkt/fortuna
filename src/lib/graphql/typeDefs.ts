import { gql } from 'graphql-tag';

export const typeDefs = gql`
  type User {
    id: ID!
    email: String!
    name: String
    createdAt: String!
    wheels: [Wheel!]!
  }

  type Wheel {
    id: ID!
    title: String!
    description: String
    segments: [WheelSegment!]!
    isPublic: Boolean!
    createdAt: String!
    user: User!
    spins: [Spin!]!
  }

  type WheelSegment {
    option: String!
    style: WheelSegmentStyle!
  }

  type WheelSegmentStyle {
    backgroundColor: String!
    textColor: String!
  }

  type Spin {
    id: ID!
    result: String!
    createdAt: String!
    user: User!
    wheel: Wheel!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  input RegisterInput {
    email: String!
    password: String!
    name: String
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input CreateWheelInput {
    title: String!
    description: String
    segments: [WheelSegmentInput!]!
    isPublic: Boolean = false
  }

  input WheelSegmentInput {
    option: String!
    style: WheelSegmentStyleInput!
  }

  input WheelSegmentStyleInput {
    backgroundColor: String!
    textColor: String!
  }

  input SpinWheelInput {
    wheelId: ID!
    result: String!
  }

  type Query {
    me: User
    wheels: [Wheel!]!
    wheel(id: ID!): Wheel
    publicWheels: [Wheel!]!
  }

  type Mutation {
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    createWheel(input: CreateWheelInput!): Wheel!
    updateWheel(id: ID!, input: CreateWheelInput!): Wheel!
    deleteWheel(id: ID!): Boolean!
    spinWheel(input: SpinWheelInput!): Spin!
  }
`; 