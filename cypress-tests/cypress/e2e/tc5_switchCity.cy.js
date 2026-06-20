describe('TC5 - Switch City', () => {

  it('Changes city and reloads graph', () => {

    cy.intercept('GET', '/api/graph*')
      .as('graphLoad');

    cy.visit('http://127.0.0.1:8080');

    // Change city
    cy.get('#citySelect')
      .select('mumbai');

    // Verify graph reload API
    cy.wait('@graphLoad')
      .its('response.statusCode')
      .should('eq', 200);

    // Verify title changed
    cy.get('#cityTitle')
      .should('contain.text', 'Mumbai');

    // Verify metadata exists
    cy.get('#cityMeta')
      .should('contain.text', 'junctions');

  });

});