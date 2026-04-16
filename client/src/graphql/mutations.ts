import { gql } from '@apollo/client/core';

export const TOGGLE_FAVORITE = gql`
  mutation ToggleFavorite($characterId: Int!) {
    toggleFavorite(characterId: $characterId) {
      id
      name
      status
      species
      type
      gender
      origin {
        name
        url
      }
      location {
        name
        url
      }
      image
      episode
      url
      created
      isFavorite
      comments {
        id
        characterId
        content
        createdAt
        updatedAt
      }
    }
  }
`;

export const ADD_COMMENT = gql`
  mutation AddComment($input: CommentInput!) {
    addComment(input: $input) {
      id
      characterId
      content
      createdAt
      updatedAt
    }
  }
`;

export const SOFT_DELETE_CHARACTER = gql`
  mutation SoftDeleteCharacter($id: Int!) {
    softDeleteCharacter(id: $id) {
      id
      name
    }
  }
`;
