describe('TC4 - Traffic Simulation', () => {

  it('Simulates congestion and recalculates route', () => {

    cy.intercept('POST', '/api/traffic/simulate')
      .as('trafficSimulation');

    cy.visit('http://127.0.0.1:8080');

    cy.get('#simulateBtn')
      .click();

    cy.wait('@trafficSimulation')
      .its('response.statusCode')
      .should('eq', 200);

    cy.get('#sourceSelect')
      .select('J2');

    cy.get('#targetSelect')
      .select('J8');

    cy.contains('button', 'Navigate')
      .click();

    cy.get('#routeResultCard')
      .should('be.visible');

  });

});