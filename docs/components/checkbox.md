MARKUP COMPONENT
PATH => views/components/checkbox.ejs
USAGE:
The component inclusion ejs tag should be wrapped by a label tag as shown. 
<!--
    <label for=`id` class="custom-checkbox-container">
       `openTag%` include(`checkbox`, {checkboxName:`name`, checkboxId:`id`, checkboxValue:`value`}) `%closeTag`
        `Label Text`
    </label>
-->

STYLING COMPONENT
PATH => public/css/components/checkbox.css
USAGE:
To override the default styles here, use the declaration block shown below in the stylesheet. The selector `.custom-checkbox-wrapper` may be changed as required. However, the selector chosen must select the enclosing label element at the least.
<!--
.custom-checkbox-wrapper {
    --custom-checkbox-wrapper-width: `checkbox width`;
    --checkmark-width: `checkmark thickness`;
    --checkmark-color: `checkmark color`;
    --custom-checkbox-wrapper-border-color: `checkbox border color`;
    --custom-checkbox-wrapper-bg: `checkbox background color`;
} */
-->