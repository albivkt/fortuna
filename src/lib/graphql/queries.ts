import { gql } from '@apollo/client';

// Запросы (Queries)
export const GET_WHEELS = gql`
  query GetWheels {
    wheels {
      id
      title
      description
      segments {
        option
        style {
          backgroundColor
          textColor
        }
        image
        imagePosition {
          x
          y
        }
      }
      isPublic
      publicSlug
      allowGuestSpin
      customDesign {
        backgroundColor
        borderColor
        textColor
        centerImage
      }
      createdAt
      user {
        id
        name
      }
      spins {
        id
        result
        participant
        createdAt
      }
    }
  }
`;

export const GET_WHEEL = gql`
  query GetWheel($id: ID!) {
    wheel(id: $id) {
      id
      title
      description
      segments {
        option
        style {
          backgroundColor
          textColor
        }
        image
        imagePosition {
          x
          y
        }
      }
      isPublic
      publicSlug
      allowGuestSpin
      customDesign {
        backgroundColor
        borderColor
        textColor
        centerImage
      }
      createdAt
      user {
        id
        name
        plan
      }
      spins {
        id
        result
        participant
        createdAt
        user {
          id
          name
        }
      }
    }
  }
`;

export const GET_PUBLIC_WHEELS = gql`
  query GetPublicWheels {
    publicWheels {
      id
      title
      description
      segments {
        option
        style {
          backgroundColor
          textColor
        }
      }
      isPublic
      createdAt
      user {
        id
        name
      }
      spins {
        id
        result
        participant
        createdAt
      }
    }
  }
`;

export const GET_ME = gql`
  query GetMe {
    me {
      id
      email
      name
      plan
      planExpiresAt
      wheels {
        id
        title
        createdAt
      }
    }
  }
`;

export const GET_PLAN_LIMITS = gql`
  query GetPlanLimits {
    planLimits {
      maxWheels
      maxSegments
      allowImages
      allowWeights
      allowCustomDesign
      allowStatistics
    }
    me {
      id
      email
      name
      plan
      planExpiresAt
    }
  }
`;

export const GET_WHEEL_BY_SLUG = gql`
  query GetWheelBySlug($slug: String!) {
    wheelBySlug(slug: $slug) {
      id
      title
      description
      segments {
        option
        style {
          backgroundColor
          textColor
        }
      }
      isPublic
      publicSlug
      allowGuestSpin
      customDesign {
        backgroundColor
        borderColor
        textColor
        centerImage
      }
      createdAt
      user {
        id
        name
        plan
      }
      spins {
        id
        result
        participant
        createdAt
        user {
          id
          name
        }
      }
    }
  }
`;

// Мутации (Mutations)
export const CREATE_WHEEL = gql`
  mutation CreateWheel($input: CreateWheelInput!) {
    createWheel(input: $input) {
      id
      title
      description
      segments {
        option
        style {
          backgroundColor
          textColor
        }
        image
        imagePosition {
          x
          y
        }
      }
      isPublic
      customDesign {
        backgroundColor
        borderColor
        textColor
        centerImage
      }
      createdAt
      user {
        id
        name
      }
      spins {
        id
        result
        participant
        createdAt
      }
    }
  }
`;

export const UPDATE_WHEEL = gql`
  mutation UpdateWheel($id: ID!, $input: UpdateWheelInput!) {
    updateWheel(id: $id, input: $input) {
      id
      title
      description
      segments {
        option
        style {
          backgroundColor
          textColor
        }
        image
        imagePosition {
          x
          y
        }
      }
      isPublic
      customDesign {
        backgroundColor
        borderColor
        textColor
        centerImage
      }
      createdAt
      user {
        id
        name
      }
      spins {
        id
        result
        participant
        createdAt
      }
    }
  }
`;

export const DELETE_WHEEL = gql`
  mutation DeleteWheel($id: ID!) {
    deleteWheel(id: $id)
  }
`;

export const SPIN_WHEEL = gql`
  mutation SpinWheel($input: SpinWheelInput!) {
    spinWheel(input: $input) {
      id
      result
      participant
      createdAt
      user {
        id
        name
      }
      wheel {
        id
        title
      }
    }
  }
`;

export const REGISTER_USER = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      user {
        id
        email
        name
      }
    }
  }
`;

export const LOGIN_USER = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        id
        email
        name
      }
    }
  }
`;

export const GENERATE_PUBLIC_LINK = gql`
  mutation GeneratePublicLink($input: GeneratePublicLinkInput!) {
    generatePublicLink(input: $input) {
      id
      title
      publicSlug
      allowGuestSpin
      segments {
        option
        style {
          backgroundColor
          textColor
        }
      }
      isPublic
      createdAt
      user {
        id
        name
      }
    }
  }
`;

export const REMOVE_PUBLIC_LINK = gql`
  mutation RemovePublicLink($wheelId: ID!) {
    removePublicLink(wheelId: $wheelId) {
      id
      title
      publicSlug
      allowGuestSpin
      segments {
        option
        style {
          backgroundColor
          textColor
        }
      }
      isPublic
      createdAt
      user {
        id
        name
      }
    }
  }
`;

export const SPIN_WHEEL_BY_SLUG = gql`
  mutation SpinWheelBySlug($slug: String!, $result: String!, $participant: String) {
    spinWheelBySlug(slug: $slug, result: $result, participant: $participant) {
      id
      result
      participant
      createdAt
      user {
        id
        name
      }
      wheel {
        id
        title
        user {
          id
          name
        }
      }
    }
  }
`;

export const UPGRADE_TO_PRO = gql`
  mutation UpgradeToPro($period: String!) {
    upgradeToPro(period: $period) {
      id
      plan
      status
      amount
      period
      startDate
      endDate
    }
  }
`; 