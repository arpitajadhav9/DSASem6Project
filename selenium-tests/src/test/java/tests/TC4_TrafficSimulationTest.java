package tests;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.Test;

public class TC4_TrafficSimulationTest extends BaseTest {

    @Test
    public void trafficSimulationTest() throws InterruptedException {

        Thread.sleep(3000);

        // Select Source
        Select source =
                new Select(driver.findElement(By.id("sourceSelect")));
        source.selectByValue("J1");

        // Select Destination
        Select target =
                new Select(driver.findElement(By.id("targetSelect")));
        target.selectByValue("J10");

        // Verify selections
        System.out.println(
                source.getFirstSelectedOption().getText()
        );

        System.out.println(
                target.getFirstSelectedOption().getText()
        );

        // Navigate
        driver.findElement(
                By.xpath("//button[contains(text(),'Navigate')]")
        ).click();

        Thread.sleep(3000);

        // Simulate Traffic
        driver.findElement(
                By.xpath("//button[contains(text(),'Simulate')]")
        ).click();

        Thread.sleep(3000);

        // Verify congestion indicators appear
        WebElement congestionLabel =
                driver.findElement(
                        By.xpath("//*[contains(text(),'x')]")
                );

        Assert.assertTrue(congestionLabel.isDisplayed());

        System.out.println("TC4 Passed");
    }
}