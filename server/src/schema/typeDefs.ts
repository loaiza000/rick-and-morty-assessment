import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  # ─── Scalars ────────────────────────────────────────────────────────────────

  scalar DateTime

  # ─── Enums ──────────────────────────────────────────────────────────────────

  enum CharacterStatus {
    Alive
    Dead
    unknown
  }

  enum CharacterGender {
    Female
    Male
    Genderless
    unknown
  }

  enum SortOrder {
    ASC
    DESC
  }

  # ─── Types ──────────────────────────────────────────────────────────────────

  type Comment {
    id: ID!
    characterId: Int!
    content: String!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Character {
    id: ID!
    name: String!
    status: CharacterStatus!
    species: String!
    gender: CharacterGender!
    origin: String!
    image: String!
    isFavorite: Boolean!
    comments: [Comment!]!
  }

  type PaginatedCharacters {
    data: [Character!]!
    total: Int!
    page: Int!
    totalPages: Int!
    hasNextPage: Boolean!
  }

  # ─── Inputs ─────────────────────────────────────────────────────────────────

  input CharacterFilter {
    name: String
    status: CharacterStatus
    species: String
    gender: CharacterGender
    origin: String
  }

  input CommentInput {
    characterId: Int!
    content: String!
  }

  # ─── Queries ────────────────────────────────────────────────────────────────

  type Query {
    characters(
      filter: CharacterFilter
      page: Int = 1
      limit: Int = 20
      sortBy: String = "name"
      sortOrder: SortOrder = ASC
    ): PaginatedCharacters!

    character(id: Int!): Character

    favorites: [Character!]!
  }

  # ─── Mutations ──────────────────────────────────────────────────────────────

  type Mutation {
    addComment(input: CommentInput!): Comment!
    toggleFavorite(characterId: Int!): Character!
    softDeleteCharacter(id: Int!): Character!
  }
`;
