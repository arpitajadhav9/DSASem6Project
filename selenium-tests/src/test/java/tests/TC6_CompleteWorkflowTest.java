package tests;

import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.Test;

public class TC6_CompleteWorkflowTest extends BaseTest {

    @Test
    public void completeWorkflowTest() throws InterruptedException {

        Thread.sleep(3000);

        // Change City
        Select cityDropdown = new Select(
                driver.findElement(By.tagName("select"))
        );

        cityDropdown.selectByIndex(0);

        Thread.sleep(2000);

        System.out.println("City Changed");

        // Select Source
        Select source = new Select(
                driver.findElement(By.id("sourceSelect"))
        );

        source.selectByValue("J1");

        // Select Destination
        Select destination = new Select(
                driver.findElement(By.id("targetSelect"))
        );

        destination.selectByValue("J10");

        Thread.sleep(1000);

        // Verify selected values
        String selectedSource =
                source.getFirstSelectedOption().getText();

        String selectedDestination =
                destination.getFirstSelectedOption().getText();

        System.out.println(selectedSource);
        System.out.println(selectedDestination);

        Assert.assertTrue(
                selectedSource.contains("J1"),
                "Source not selected correctly"
        );

        Assert.assertTrue(
                selectedDestination.contains("J10"),
                "Destination not selected correctly"
        );

        // Simulate Traffic Congestion
        driver.findElement(
                By.xpath("//button[contains(text(),'Simulate')]")
        ).click();

        Thread.sleep(3000);

        // Generate Route Comparison
        driver.findElement(
                By.xpath("//button[contains(text(),'Compare')]")
        ).click();

        Thread.sleep(3000);

        // Verify comparison data exists
        String pageSource = driver.getPageSource();

        Assert.assertTrue(
                pageSource.contains("Distance"),
                "Distance data missing"
        );

        Assert.assertTrue(
                pageSource.contains("Travel Time"),
                "Travel Time data missing"
        );

        Assert.assertTrue(
                pageSource.contains("Fastest")
                        || pageSource.contains("FASTEST"),
                "Fastest route data missing"
        );

        Assert.assertTrue(
                pageSource.contains("Shortest")
                        || pageSource.contains("SHORTEST"),
                "Shortest route data missing"
        );

        System.out.println("TC6 Passed");
    }
}