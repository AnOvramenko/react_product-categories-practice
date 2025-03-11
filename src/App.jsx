/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useState } from 'react';
import cn from 'classnames';
import './App.scss';

import usersFromServer from './api/users';
import categoriesFromServer from './api/categories';
import productsFromServer from './api/products';

const products = productsFromServer.map(product => {
  const category = categoriesFromServer.find(
    cat => product.categoryId === cat.id,
  );
  const user = usersFromServer.find(userr => category.ownerId === userr.id);

  return { ...product, category, user };
});

const SORT_BY = {
  ID: 'ID',
  PRODUCT: 'Product',
  CATEGORY: 'Category',
  USER: 'User',
};

function getPreparedProducts(
  listOfProducts,
  filterByUser,
  inputFilter,
  sortQuery,
  sortOrder,
  selectedCategories,
) {
  let currProducts = [...listOfProducts];

  if (filterByUser) {
    currProducts = currProducts.filter(
      ({ user }) => user.name === filterByUser,
    );
  }

  if (inputFilter) {
    currProducts = currProducts.filter(product => {
      return product.name
        .toLowerCase()
        .includes(inputFilter.toLowerCase().trim());
    });
  }

  if (selectedCategories.length > 0) {
    currProducts = currProducts.filter(product => {
      return selectedCategories.includes(product.category.title);
    });
  }

  switch (sortQuery) {
    case SORT_BY.PRODUCT:
      currProducts.sort((product1, product2) => {
        return product1.name.localeCompare(product2.name);
      });
      break;
    case SORT_BY.USER:
      currProducts.sort((product1, product2) => {
        return product1.user.name.localeCompare(product2.user.name);
      });
      break;
    case SORT_BY.CATEGORY:
      currProducts.sort((product1, product2) => {
        return product1.category.title.localeCompare(product2.category.title);
      });
      break;
    case SORT_BY.ID:
      currProducts.sort((product1, product2) => {
        return product1.id - product2.id;
      });
      break;
    default:
      break;
  }

  if (sortOrder) {
    currProducts = [...currProducts].reverse();
  }

  return currProducts;
}

export const App = () => {
  const [filterByUser, setFilterByUser] = useState('');
  const [inputFilter, setInputFilter] = useState('');
  const [sortQuery, setSortQuery] = useState('');
  const [sortOrder, setSortOrder] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);

  const filteredProducts = getPreparedProducts(
    products,
    filterByUser,
    inputFilter,
    sortQuery,
    sortOrder,
    selectedCategories,
  );

  const handleSort = value => {
    if (sortQuery === value) {
      if (sortOrder === false) {
        setSortOrder(true);
      } else if (sortOrder === true) {
        setSortQuery('');
        setSortOrder(false);
      }
    } else {
      setSortQuery(value);
      setSortOrder(false);
    }
  };

  const handleCategoryClick = categoryTitle => {
    setSelectedCategories(prevSelectedCategories => {
      return prevSelectedCategories.includes(categoryTitle)
        ? prevSelectedCategories.filter(title => title !== categoryTitle)
        : [...prevSelectedCategories, categoryTitle];
    });
  };

  const handleClearAll = () => {
    setFilterByUser('');
    setInputFilter('');
    setSortQuery('');
    setSortOrder(false);
    setSelectedCategories([]);
  };

  return (
    <div className="section">
      <div className="container">
        <h1 className="title">Product Categories</h1>

        <div className="block">
          <nav className="panel">
            <p className="panel-heading">Filters</p>

            <p className="panel-tabs has-text-weight-bold">
              <a
                className={cn({
                  'is-active': filterByUser === '',
                })}
                data-cy="FilterAllUsers"
                href="#/"
                onClick={() => setFilterByUser('')}
              >
                All
              </a>

              {usersFromServer.map(user => (
                <a
                  className={cn({
                    'is-active': filterByUser === user.name,
                  })}
                  data-cy="FilterUser"
                  key={user.id}
                  href="#/"
                  onClick={() => setFilterByUser(user.name)}
                >
                  {user.name}
                </a>
              ))}
            </p>

            <div className="panel-block">
              <p className="control has-icons-left has-icons-right">
                <input
                  data-cy="SearchField"
                  type="text"
                  className="input"
                  placeholder="Search"
                  value={inputFilter}
                  onChange={event => setInputFilter(event.target.value)}
                />

                <span className="icon is-left">
                  <i className="fas fa-search" aria-hidden="true" />
                </span>

                <span className="icon is-right">
                  {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
                  {inputFilter && (
                    <button
                      data-cy="ClearButton"
                      type="button"
                      className="delete"
                      onClick={() => setInputFilter('')}
                    />
                  )}
                </span>
              </p>
            </div>

            <div className="panel-block is-flex-wrap-wrap">
              <a
                href="#/"
                data-cy="AllCategories"
                className={cn('button is-success mr-6', {
                  'is-outlined': selectedCategories.length > 0,
                })}
                onClick={() => setSelectedCategories([])}
              >
                All
              </a>
              {categoriesFromServer.map(category => (
                <a
                  key={category.id}
                  data-cy="Category"
                  className={cn('button mr-2 my-1', {
                    'is-info': selectedCategories.includes(category.title),
                  })}
                  href="#/"
                  onClick={() => handleCategoryClick(category.title)}
                >
                  {category.title}
                </a>
              ))}
            </div>

            <div className="panel-block">
              <a
                data-cy="ResetAllButton"
                href="#/"
                className="button is-link is-outlined is-fullwidth"
                onClick={handleClearAll}
              >
                Reset all filters
              </a>
            </div>
          </nav>
        </div>

        <div className="box table-container">
          {filteredProducts.length ? (
            <table
              data-cy="ProductTable"
              className="table is-striped is-narrow is-fullwidth"
            >
              <thead>
                <tr>
                  {Object.values(SORT_BY).map(value => (
                    <th key={value}>
                      <span className="is-flex is-flex-wrap-nowrap">
                        {value}
                        <a href="#/" onClick={() => handleSort(value)}>
                          <span className="icon">
                            <i
                              data-cy="SortIcon"
                              className={cn('fas', {
                                'fa-sort': sortQuery !== value,
                                'fa-sort-up': sortQuery === value && sortOrder,
                                'fa-sort-down':
                                  sortQuery === value && !sortOrder,
                              })}
                            />
                          </span>
                        </a>
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map(product => (
                  <tr data-cy="Product" key={product.id}>
                    <td className="has-text-weight-bold" data-cy="ProductId">
                      {product.id}
                    </td>

                    <td data-cy="ProductName">{product.name}</td>
                    <td data-cy="ProductCategory">{`${product.category.icon} - ${product.category.title}`}</td>

                    <td
                      data-cy="ProductUser"
                      className={cn({
                        'has-text-danger': product.user.sex === 'f',
                        'has-text-link': product.user.sex === 'm',
                      })}
                    >
                      {product.user.name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p data-cy="NoMatchingMessage">
              No products matching selected criteria
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
