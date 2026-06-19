package tests;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.testng.Assert;
import org.testng.annotations.Test;
import org.openqa.selenium.support.ui.Select;

public class TC2_ShortestRouteTest extends BaseTest {

    @Test
    public void shortestRouteTest() throws InterruptedException {

        Thread.sleep(3000);

        Select source = new Select(driver.findElement(By.id("sourceSelect")));
        source.selectByValue("J3");

        Select target = new Select(driver.findElement(By.id("targetSelect")));
        target.selectByValue("J8");
        driver.findElement(
                By.xpath("//span[contains(text(),'Shortest')]")
        ).click();

        driver.findElement(By.xpath("//button[contains(text(),'Navigate')]"))
                .click();

        Thread.sleep(3000);

        WebElement resultCard =
                driver.findElement(By.id("routeResultCard"));

        Assert.assertTrue(resultCard.isDisplayed());

        System.out.println("TC2 Passed");
    }
}