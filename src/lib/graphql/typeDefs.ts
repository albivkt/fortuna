import { gql } from 'graphql-tag';

export const typeDefs = gql`
  type User {
    id: ID!
    email: String!
    name: String
    plan: String!
    planExpiresAt: String
    createdAt: String!
    wheels: [Wheel!]!
    subscriptions: [Subscription!]!
  }

  type Wheel {
    id: ID!
    title: String!
    description: String
    segments: [WheelSegment!]!
    isPublic: Boolean!
    publicSlug: String
    allowGuestSpin: Boolean!
    segmentWeights: [Float!]
    customDesign: CustomDesign
    createdAt: String!
    user: User!
    spins: [Spin!]!
  }

  type CustomDesign {
    backgroundColor: String
    borderColor: String
    textColor: String
    centerImage: String
  }

  type WheelSegment {
    option: String!
    style: WheelSegmentStyle!
    weight: Float
    image: String
    imagePosition: ImagePosition
  }

  type ImagePosition {
    x: Float!
    y: Float!
  }

  type WheelSegmentStyle {
    backgroundColor: String!
    textColor: String!
  }

  type Spin {
    id: ID!
    result: String!
    participant: String
    createdAt: String!
    user: User!
    wheel: Wheel!
  }

  type Subscription {
    id: ID!
    plan: String!
    status: String!
    amount: Int!
    currency: String!
    period: String!
    startDate: String!
    endDate: String!
    createdAt: String!
  }

  type PlanLimits {
    maxWheels: Int!
    maxSegments: Int!
    allowImages: Boolean!
    allowWeights: Boolean!
    allowCustomDesign: Boolean!
    allowStatistics: Boolean!
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
    allowGuestSpin: Boolean = false
    customDesign: CustomDesignInput
  }

  input UpdateWheelInput {
    title: String!
    description: String
    segments: [WheelSegmentInput!]!
    isPublic: Boolean = false
    allowGuestSpin: Boolean = false
    customDesign: CustomDesignInput
  }

  input CustomDesignInput {
    backgroundColor: String
    borderColor: String
    textColor: String
    centerImage: String
  }

  input GeneratePublicLinkInput {
    wheelId: ID!
  }

  input WheelSegmentInput {
    option: String!
    style: WheelSegmentStyleInput!
    weight: Float
    image: String
    imagePosition: ImagePositionInput
  }

  input ImagePositionInput {
    x: Float!
    y: Float!
  }

  input WheelSegmentStyleInput {
    backgroundColor: String!
    textColor: String!
  }

  input SpinWheelInput {
    wheelId: ID!
    result: String!
    participant: String
  }

  input CreateSubscriptionInput {
    plan: String!
    period: String!
  }

  input CreatePaymentInput {
    period: String!
  }

  type PaymentResult {
    paymentId: String!
    confirmationUrl: String!
    amount: String!
    description: String!
  }

  type PaymentStatus {
    id: String!
    status: String!
    amount: String!
    description: String
    paid: Boolean!
  }

  type Query {
    me: User
    wheels: [Wheel!]!
    wheel(id: ID!): Wheel
    wheelBySlug(slug: String!): Wheel
    publicWheels: [Wheel!]!
    planLimits: PlanLimits!
    subscriptions: [Subscription!]!
  }

  type Mutation {
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    createWheel(input: CreateWheelInput!): Wheel!
    updateWheel(id: ID!, input: UpdateWheelInput!): Wheel!
    deleteWheel(id: ID!): Boolean!
    spinWheel(input: SpinWheelInput!): Spin!
    generatePublicLink(input: GeneratePublicLinkInput!): Wheel!
    removePublicLink(wheelId: ID!): Wheel!
    spinWheelBySlug(slug: String!, result: String!, participant: String): Spin!
    createSubscription(input: CreateSubscriptionInput!): Subscription!
    cancelSubscription(subscriptionId: ID!): Subscription!
    upgradeToPro(period: String!): Subscription!
    createPayment(input: CreatePaymentInput!): PaymentResult!
    checkPaymentStatus(paymentId: String!): PaymentStatus!
  }
`; 