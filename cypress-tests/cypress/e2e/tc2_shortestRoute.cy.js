describe('TC2 - Shortest Route Calculation', () => {

  it('Calculates shortest route successfully', () => {

    cy.visit('http://127.0.0.1:8080');

    // Select source
    cy.get('#sourceSelect')
      .select('J3');

    // Select destination
    cy.get('#targetSelect')
      .select('J9');

    // Select Shortest strategy
    cy.get('input[value="distance"]')
      .check({ force: true });

    // Click Navigate
    cy.contains('button', 'Navigate')
      .click();

    // Verify result card appears
    cy.get('#routeResultCard')
      .should('be.visible');

    // Verify route summary generated
    cy.get('#routeSummary')
      .should('contain.text', 'Total Distance');

    // Verify route type shows Shortest
    cy.get('#routeSummary')
      .should('contain.text', 'Shortest');

    // Verify route steps exist
    cy.get('#routeSteps')
      .should('exist');

  });

});