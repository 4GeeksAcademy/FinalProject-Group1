import React from 'react';

const Pagination = ({ recipesPerPage, totalRecipes, currentPage, paginate }) => {
    const pageNumbers = [];


    for (let i = 1; i <= Math.ceil(totalRecipes / recipesPerPage); i++) {
        pageNumbers.push(i);
    }

    if (pageNumbers.length <= 1) return null;

    return (
        <nav className="d-flex justify-content-center my-4">
            <ul className="pagination">
                {/* Botón Anterior */}
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button onClick={() => paginate(currentPage - 1)} className="page-link" aria-label="Previous">
                        <span aria-hidden="true">&laquo;</span>
                    </button>
                </li>

                {pageNumbers.map(number => (
                    <li key={number} className={`page-item ${number === currentPage ? 'active' : ''}`}>
                        <button onClick={() => paginate(number)} className="page-link">
                            {number}
                        </button>
                    </li>
                ))}

                <li className={`page-item ${currentPage === pageNumbers.length ? 'disabled' : ''}`}>
                    <button onClick={() => paginate(currentPage + 1)} className="page-link" aria-label="Next">
                        <span aria-hidden="true">&raquo;</span>
                    </button>
                </li>
            </ul>
        </nav>
    );
};

export default Pagination; 