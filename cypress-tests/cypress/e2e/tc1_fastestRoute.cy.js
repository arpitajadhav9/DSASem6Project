describe('TC1 - Fastest Route Calculation', () => {

  it('Calculates fastest route successfully', () => {

    // Open application
    cy.visit('http://127.0.0.1:8080');

    // Select source junction
    cy.get('#sourceSelect')
      .select('J1');

    // Select destination junction
    cy.get('#targetSelect')
      .select('J10');

    // Fastest mode is selected by default

    // Click Navigate button
   cy.contains('button', 'Navigate').click();

    // Verify route result card appears
    cy.get('#routeResultCard')
      .should('be.visible');

    // Verify route summary is generated
    cy.get('#routeSummary')
      .should('not.be.empty');

    // Verify route steps are displayed
    cy.get('#routeSteps')
      .should('exist');

  });

});