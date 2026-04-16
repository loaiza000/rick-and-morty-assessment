import { gql } from '@apollo/client/core';

export const GET_CHARACTERS = gql`
  query GetCharacters(
    $filter: CharacterFilter
    $page: Int
    $limit: Int
    $sortBy: String
    $sortOrder: SortOrder
  ) {
    characters(
      filter: $filter
      page: $page
      limit: $limit
      sortBy: $sortBy
      sortOrder: $sortOrder
    ) {
      data {
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
      total
      page
      totalPages
      hasNextPage
    }
  }
`;

export const GET_CHARACTER = gql`
  query GetCharacter($id: Int!) {
    character(id: $id) {
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

export const GET_FAVORITES = gql`
  query GetFavorites {
    favorites {
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
