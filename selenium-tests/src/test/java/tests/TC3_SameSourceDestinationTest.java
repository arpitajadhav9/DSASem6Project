package tests;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.testng.Assert;
import org.testng.annotations.Test;
import org.openqa.selenium.support.ui.Select;

public class TC3_SameSourceDestinationTest extends BaseTest {

    @Test
    public void sameSourceDestinationTest() throws InterruptedException {

        Thread.sleep(3000);

        Select source = new Select(driver.findElement(By.id("sourceSelect")));
        source.selectByValue("J5");

        Select target = new Select(driver.findElement(By.id("targetSelect")));
        target.selectByValue("J5");

        driver.findElement(
                By.xpath("//button[contains(text(),'Navigate')]")
        ).click();

        Thread.sleep(3000);

        WebElement resultCard =
                driver.findElement(By.id("routeResultCard"));

        Assert.assertTrue(resultCard.isDisplayed());

        String resultText = resultCard.getText();

        Assert.assertTrue(
                resultText.contains("0 km")
        );

        System.out.println("TC3 Passed");
    }
}