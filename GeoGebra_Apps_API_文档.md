# GeoGebra Apps API 文档

> 来源：[GeoGebra Apps API 官方参考](https://geogebra.github.io/docs/reference/en/GeoGebra_Apps_API/)  
> 本页面用于与 GeoGebra 应用（Applet）交互。如何把应用嵌入网页请参考 [GeoGebra Apps Embedding](https://geogebra.github.io/docs/reference/en/GeoGebra_Apps_Embedding/)。

> 本文档共整理 **153** 个 API 方法、**39** 个客户端事件，并附 **3** 段「获取 API 对象」代码示例。

## 目录

- [示例](#examples)
- [创建对象](#creating-objects)（6）
- [设置对象状态](#setting-the-state-of-objects)（0）
- [设置对象状态 / 通用方法](#setting-the-state-of-objects-general-methods)（31）
- [设置对象状态 / 自动动画](#setting-the-state-of-objects-automatic-animation)（5）
- [获取对象状态](#getting-the-state-of-objects)（30）
- [构造 / 用户界面](#construction-user-interface)（48）
- [事件监听器](#event-listeners)（20）
- [事件监听器 / 客户端事件](#event-listeners-client-events)（39）
- [GeoGebra 文件格式](#geogebra-s-file-format)（10）
- [杂项](#miscellaneous)（3）
- [杂项 / 获取 API 对象](#miscellaneous-obtaining-the-api-object)（0）
- [杂项 / 以模块方式获取 API 对象（ES6）](#miscellaneous-obtaining-the-api-object-as-a-module-the-es6-way)（0）

## 示例 

官方在线示例：

- [Showing & hiding objects with buttons](https://geogebra.github.io/integration/example-api.html)
- [Saving & loading state](https://geogebra.github.io/integration/example-api-save-state.html)
- [Listening to update, add, remove events](https://geogebra.github.io/integration/example-api-listeners.html)

> 提示：示例中演示了用按钮显隐对象、保存/加载状态、监听事件等典型用法，建议结合下方方法说明一起阅读。

## 创建对象 

#### `boolean evalCommand(String cmdString)` 

- **起始版本**：3.0
- **说明**：

Evaluates the given string just like it would be evaluated when entered  
into GeoGebra’s input bar. Returns whether command evaluation was successful. From GeoGebra 3.2 you can pass multiple  
commands at once by separating them with \n. Note: you must use English commands names

#### `boolean evalLaTex(String input)` 

- **起始版本**：5.0
- **说明**：

Evaluates LaTeX string to a construction element. Basic syntaxes like `x^{2}` or `\frac` are supported.

#### `String evalCommandGetLabels(String cmdString)` 

- **起始版本**：5.0
- **说明**：

Like evalCommand(), but the return value is a String containing a  
comma-separated list of the labels of the created objects eg `"A,B,C"`

#### `String evalCommandCAS(String string)` 

- **起始版本**：3.2
- **说明**：

Passes the string to GeoGebra’s CAS and returns the result as a String.

#### `String evalLaTeX(String string)` 

- **起始版本**：6.0
- **说明**：

Evaluates input as LaTeX. Common LaTeX constructs like `\sqrt{x}` or `\frac{x}{x-1}` are supported.

#### `void insertEmbed(String type, String uri)` 

- **起始版本**：6.0 (Notes)
- **说明**：

Inserts embedded element with specific type and URI.  
Type and URI are then used to obtain the HTML code for the embed element, see `registerEmbedResolver`

## 设置对象状态 

### 通用方法 

> 共 31 个方法

#### `void deleteObject(String objName)` 

- **起始版本**：2.7
- **说明**：

Deletes the object with the given name.

#### `void setAuxiliary(geo, true/false)` 

- **起始版本**：5.0
- **说明**：

Affects or not the status of "auxiliary object" to object *geo*.

#### `void setValue(String objName, double value)` 

- **起始版本**：3.2
- **说明**：

Sets the double value of the object with the given name. Note: if the  
specified object is boolean, use a value of 1 to set it to true and any other value to set it to false. For any other  
object type, nothing is done.

#### `void setTextValue(String objName, String value)` 

- **起始版本**：3.2
- **说明**：

Sets the text value of the object with the given name. For any  
other object type, nothing is done.

#### `void setListValue(String objName, int i, double value)` 

- **起始版本**：5.0
- **说明**：

Sets the value of the list element at position 'i' to  
'value'

#### `void setCoords(String objName, double x, double y)void setCoords(String objName, double x, double y, double z)` 

- **起始版本**：3.05.0
- **说明**：

Sets the coordinates of the object with the given name. Note: if the specified object is not a point, vector, line or  
absolutely positioned object (text, button, checkbox, input box) nothing is done.

#### `void setCaption(String objName, String caption)` 

- **起始版本**：5.0
- **说明**：

Sets the caption of object with given name.

#### `void setColor(String objName, int red, int green, int blue)` 

- **起始版本**：2.7
- **说明**：

Sets the color of the object with the given name.

#### `void setVisible(String objName, boolean visible)` 

- **起始版本**：2.7
- **说明**：

Shows or hides the object with the given name in the graphics  
window.

#### `void setLabelVisible(String objName, boolean visible)` 

- **起始版本**：3.0
- **说明**：

Shows or hides the label of the object with the given name  
in the graphics window.

#### `void setLabelStyle(String objName, int style)` 

- **起始版本**：3.0
- **说明**：

Sets the label style of the object with the given name in the  
graphics window. Possible label styles are NAME = 0, NAME_VALUE = 1, VALUE = 2 and (from GeoGebra 3.2) CAPTION = 3

#### `void setFixed(String objName, boolean fixed, boolean selectionAllowed)` 

- **起始版本**：3.0
- **说明**：

Sets the "Fixed" and "Selection Allowed"  
state of the object with the given name. Note: fixed objects cannot be changed.

#### `void setTrace(String objName, boolean flag)` 

- **起始版本**：3.0
- **说明**：

Turns the trace of the object with the given name on or off.

#### `boolean renameObject(String oldObjName, String newObjName)` 

- **起始版本**：3.2
- **说明**：

Renames oldObjName to newObjName. Returns whether the  
rename was successful

#### `void setLayer(String objName, int layer)` 

- **起始版本**：3.2
- **说明**：

Sets the layer of the object

#### `void setLayerVisible(int layer, boolean visible)` 

- **起始版本**：3.2
- **说明**：

Shows or hides the all objects in the given layer

#### `void setLineStyle(String objName, int style)` 

- **起始版本**：3.2
- **说明**：

Sets the line style for the object (0 to 4)

#### `void setLineThickness(String objName, int thickness)` 

- **起始版本**：3.2
- **说明**：

sets the thickness of the object (1 to 13, -1 for default)

#### `void setPointStyle(String objName, int style)` 

- **起始版本**：3.2
- **说明**：

Sets the style of points (-1 default, 0 filled circle, 1 cross, 2  
circle, 3 plus, 4 filled diamond, 5 unfilled diamond, 6 triangle (north), 7 triangle (south), 8 triangle (east), 9  
triangle (west)) - see SetPointStyle Command for the full list

#### `void setPointSize(String objName, int size)` 

- **起始版本**：3.2
- **说明**：

Sets the size of a point (from 1 to 9)

#### `void setDisplayStyle(String objName, String style)` 

- **起始版本**：5.0
- **说明**：

Sets the display style of an object. Style should be one of  
"parametric", "explicit", "implicit", "specific"

#### `void setFilling(String objName, double filling)` 

- **起始版本**：3.2
- **说明**：

Sets the filling of an object (from 0 to 1)

#### `String getPNGBase64(double exportScale, boolean transparent, double DPI)` 

- **起始版本**：4.0
- **说明**：

Returns the active Graphics View as a  
base64-encoded Stringeg var str = ggbApplet.getPNGBase64(1, true, 72); The DPI setting is slow, set to `undefined`  
if you don’t need it

#### `void exportSVG(String filename) or void exportSVG(function callback)` 

- **起始版本**：HTML5
- **说明**：

Renders the active Graphics View as an SVG  
and either downloads it as the given filename or sends it to the callback function The value is `null` if the active  
view is 3D `ggbApplet.exportSVG(svg => console.log("data:image/svg+xml;utf8," + encodeURIComponent(svg)));` For  
Classic 5 compatibility please use `ExportImage("type", "svg", "filename", "foo.svg")` inside materials

#### \`void exportPDF(double scale, String filename, String sliderLabel) or void exportPDF(double scale, function callback,

String sliderLabel)\` <a id="exportpdf"></a>

- **起始版本**：HTML5
- **说明**：

Renders the active Graphics View as a PDF and either downloads it as the given filename or  
sends it to the callback function `ggbApplet.exportPDF(1, pdf => console.log(pdf));` For Classic 5 compatibility  
please use `ExportImage("type", "pdf", "filename", "foo.pdf")` instead

#### `void getScreenshotBase64(function callback)` 

- **起始版本**：5.0
- **说明**：

Gets the screenshot of the whole applet as PNG and sends it to the  
callback function as a base64 encoded string. Example:  
` ggbApplet.getScreenshotBase64(function(url){window.open("data:image/png;base64,"+url);});`*For internal use only,  
may not work in all browsers*

#### `boolean writePNGtoFile(String filename, double exportScale, boolean transparent, double DPI)` 

- **起始版本**：4.0
- **说明**：

Exports the active  
Graphics View to a .PNG file. The DPI setting is slow, set to `undefined` if you don’t need it eg var success =  
ggbApplet.writePNGtoFile("myImage.png", 1, false, 72);

#### `boolean isIndependent(String objName)` 

- **起始版本**：4.0
- **说明**：

checks if *objName* is independent

#### `boolean isMoveable(String objName)` 

- **起始版本**：4.0
- **说明**：

checks if *objName* is is moveable

#### `void showAllObjects()` 

- **起始版本**：5.0
- **说明**：

Changes bounds of the Graphics View so that all visible objects are on screen.

#### `void registerEmbedResolver(String type, Function callback)` 

- **起始版本**：6.0
- **说明**：

Adds a resolving function for specific embedded element type. The function gets an ID of the embed and returns a promise that resolves to an HTML string.

### 自动动画 

> 共 5 个方法

#### `void setAnimating(String objName, boolean animate)` 

- **起始版本**：3.2
- **说明**：

Sets whether an object should be animated. This does not start  
the animation yet, use startAnimation() to do so.

#### `void setAnimationSpeed(String objName, double speed)` 

- **起始版本**：3.2
- **说明**：

Sets the animation speed of an object.

#### `void startAnimation()` 

- **起始版本**：3.2
- **说明**：

Starts automatic animation for all objects with the animating flag set, see setAnimating()

#### `void stopAnimation()` 

- **起始版本**：3.2
- **说明**：

Stops animation for all objects with the animating flag set, see setAnimating()

#### `boolean isAnimationRunning()` 

- **起始版本**：3.2
- **说明**：

Returns whether automatic animation is currently running.

## 获取对象状态 

#### `double getXcoord(String objName)` 

- **起始版本**：2.7
- **说明**：

Returns the cartesian x-coord of the object with the given name. Note: returns 0  
if the object is not a point or a vector.

#### `double getYcoord(String objName)` 

- **起始版本**：2.7
- **说明**：

Returns the cartesian y-coord of the object with the given name. Note: returns 0  
if the object is not a point or a vector.

#### `double getZcoord(String objName)` 

- **起始版本**：5.0
- **说明**：

Returns the cartesian z-coord of the object with the given name. Note: returns 0  
if the object is not a point or a vector.

#### `double getValue(String objName)` 

- **起始版本**：3.2
- **说明**：

Returns the double value of the object with the given name (e.g. length of  
segment, area of polygon). Note: returns 1 for a boolean object with value true. Otherwise, 0 is returned.

#### `double getListValue(String objName, Integer index)` 

- **起始版本**：5.0
- **说明**：

Returns the double value of the object in the list (with the  
given name) with the given index. Note: returns 1 for a boolean object with value true. Otherwise, 0 is returned.

#### `String getColor(String objName)` 

- **起始版本**：2.7
- **说明**：

Returns the color of the object with the given name as a hex string, e.g.  
"#FF0000" for red. Note that the hex string always starts with # and contains no lower case letters.

#### `boolean getVisible(String objName)` 

- **起始版本**：3.2
- **说明**：

Returns true or false depending on whether the object is visible in the  
Graphics View. Returns false if the object does not exist.

#### `boolean getVisible(String objName, int view)` 

- **起始版本**：4.2
- **说明**：

Returns true or false depending on whether the object is visible in  
Graphics View `view` (1 or 2). Returns false if the object does not exist.

#### `String getValueString(String objName [, boolean useLocalizedInput = true])` 

- **起始版本**：2.7
- **说明**：

Returns the value of the object with  
the given name as a string. If useLocalizedInput is false, returns the command in English, otherwise in current GUI  
language. Note: Localized input uses parentheses, non-localized input uses brackets.For this method (*and all others  
returning type String*) it’s important to coerce it properly to a JavaScript string for compatibility with GeoGebra  
Classic 5 eg `var s = getValueString("text1") + "";`

#### `String getDefinitionString(String objName)` 

- **起始版本**：2.7
- **说明**：

Returns the description of the object with the given name as a string  
(in the currently selected language)

#### `String getCommandString(String objName [, boolean useLocalizedInput])` 

- **起始版本**：5.0
- **说明**：

Returns the command of the object with the  
given name as a string. If useLocalizedInput is false, returns the command in English, otherwise in current GUI  
language. Note: Localized input uses parentheses, non-localized input uses brackets.

#### `String getLaTeXString(String objName)` 

- **起始版本**：5.0
- **说明**：

Returns the value of given object in LaTeX syntax

#### `String getLaTeXBase64(String objName, boolean value)` 

- **起始版本**：5.0
- **说明**：

Returns base64 encoded PNG picture containing the object as  
LaTeX. For value = false the object is represented as the definition, for value=true the object value is used.

#### `String getObjectType(String objName)` 

- **起始版本**：2.7
- **说明**：

Returns the type of the given object as a string (like "point", "line",  
or "circle").

#### `boolean exists(String objName)` 

- **起始版本**：2.7
- **说明**：

Returns whether an object with the given name exists in the construction.

#### `boolean isDefined(String objName)` 

- **起始版本**：2.7
- **说明**：

Returns whether the given object’s value is valid at the moment.

#### `String [] getAllObjectNames([String type])` 

- **起始版本**：2.7
- **说明**：

Returns an array with all object names in the construction. If type  
parameter is entered, only objects of given type are returned.

#### `int getObjectNumber()` 

- **起始版本**：3.0
- **说明**：

Returns the number of objects in the construction.

#### `int getCASObjectNumber()` 

- **起始版本**：3.0
- **说明**：

Returns the number of object (nonempty cells) in CAS.

#### `String getObjectName(int i)` 

- **起始版本**：3.0
- **说明**：

Returns the name of the n-th object of the construction.

#### `String getLayer(String objName)` 

- **起始版本**：3.2
- **说明**：

Returns the layer of the object.

#### `int getLineStyle(String objName)` 

- **起始版本**：3.2
- **说明**：

Gets the line style for the object (0 to 4)

#### `int getLineThickness(String objName)` 

- **起始版本**：3.2
- **说明**：

Gets the thickness of the line (1 to 13)

#### `int getPointStyle(String objName)` 

- **起始版本**：3.2
- **说明**：

Gets the style of points (-1 default, 0 filled circle, 1 circle, 2 cross, 3  
plus, 4 filled diamond, 5 unfilled diamond, 6 triangle (north), 7 triangle (south), 8 triangle (east), 9 triangle  
(west))

#### `int getPointSize(String objName)` 

- **起始版本**：3.2
- **说明**：

Gets the size of a point (from 1 to 9)

#### `double getFilling(String objName)` 

- **起始版本**：3.2
- **说明**：

Gets the filling of an object (from 0 to 1)

#### `getCaption(String objectName, boolean substitutePlaceholders)` 

- **起始版本**：5.0
- **说明**：

Returns the caption of the object. If the caption  
contains placeholders (%n, %v,…​), you can use the second parameter to specify whether you want to substitute them or  
not.

#### `getLabelStyle(String objectName)` 

- **起始版本**：5.0
- **说明**：

Returns label type for given object, see setLabelStyle for possible values.

#### `getLabelVisible()` 

- **起始版本**：5.0
- **说明**：

（官方未提供说明）

#### `isInteractive(String objName)` 

- **起始版本**：—
- **说明**：

Returns true, if the object with label objName is existing and the user can get to  
this object using TAB.

## 构造 / 用户界面 

#### `void setMode(int mode)` 

- **起始版本**：2.7
- **说明**：

Sets the mouse mode (i.e. tool) for the graphics window (see  
toolbar reference and the applet parameters "showToolBar"  
and  "customToolBar" )

#### `int getMode()` 

- **起始版本**：5.0
- **说明**：

Gets the mouse mode (i.e. tool), see toolbar reference for details

#### `void openFile(String strURL)` 

- **起始版本**：2.7 (Java only)
- **说明**：

Opens a construction from a  file (given as absolute or relative URL  
string)

#### `void reset()` 

- **起始版本**：2.7
- **说明**：

Reloads the initial construction (given in filename parameter) of this applet.

#### `void newConstruction()` 

- **起始版本**：2.7
- **说明**：

Removes all construction objects

#### `void refreshViews()` 

- **起始版本**：2.7
- **说明**：

Refreshes all views. Note: this clears all traces in the graphics window.

#### `void setOnTheFlyPointCreationActive(boolean flag)` 

- **起始版本**：3.2
- **说明**：

Turns on the fly creation of points in graphics view on (true)  
or off (false). Note: this is useful if you don’t want tools to have the side effect of creating points. For example,  
when this flag is set to false, the tool "line through two points" will not create points on the fly when you click on  
the background of the graphics view.

#### `void setPointCapture(view, mode)` 

- **起始版本**：5.0
- **说明**：

Change point capturing mode.

view: 1 for graphics, 2 for graphics 2, -1 for 3D.

mode: 0 for no capturing, 1 for snap to grid, 2 for fixed to grid, 3 for automatic.

#### `void setRounding(string round)` 

- **起始版本**：5.0
- **说明**：

The string consists of a number and flags, "s" flag for significant digits, "d"  
for decimal places (default). JavaScript integers are cast to string automatically. Example: "10s", "5", 3

#### `void hideCursorWhenDragging(boolean flag)` 

- **起始版本**：3.2
- **说明**：

Hides (true) or shows (false) the mouse cursor (pointer) when dragging  
an object to change the construction.

#### `void setRepaintingActive(boolean flag)` 

- **起始版本**：2.7
- **说明**：

Turns the repainting of this applet on (true) or off (false). Note: use  
this method for efficient repainting when you invoke several methods.

#### `void setErrorDialogsActive(boolean flag)` 

- **起始版本**：3.0
- **说明**：

Turns showing of error dialogs on (true) or off (false). Note: this is  
especially useful together with evalCommand().

#### `void setCoordSystem(double xmin, double xmax, double ymin, double ymax)` 

- **起始版本**：3.0
- **说明**：

Sets the Cartesian coordinate system of  
the graphics window.

#### `void setCoordSystem(double xmin, double xmax, double ymin, double ymax, double zmin, double zmax, boolean yVertical)` 

- **起始版本**：5.0
- **说明**：

Sets the Cartesian coordinate system of the 3D graphics window. The last parameter determines whether y-axis  
should be oriented vertically.

#### `void setAxesVisible(boolean xAxis, boolean yAxis)` 

- **起始版本**：3.0
- **说明**：

Shows or hides the x- and y-axis of the coordinate system in  
the graphics windows 1 and 2.

#### `void setAxesVisible(int viewNumber, boolean xAxis, boolean yAxis, boolean zAxis)` 

- **起始版本**：5.0
- **说明**：

Shows or hides the x-, y- and z-axis of the coordinate system in given graphics window.



`ggbApplet.setAxesVisible(3, false, true, true)`

#### `void setAxisLabels(int viewNumber, String xAxis, String yAxis, String zAxis)` 

- **起始版本**：5.0
- **说明**：

Set label for the x-, y- and z-axis of the coordinate system in given graphics window.

`ggbApplet.setAxisLabels(3,"large","long","area")`

#### `void setAxisSteps(int viewNumber, double xAxis, double yAxis, double zAxis)` 

- **起始版本**：5.0
- **说明**：

Set distance for the x-, y- and z-axis of the coordinate system in given graphics window.

`ggbApplet.setAxisSteps(3, 2,1,0.5)`

#### `void setAxisUnits(int viewNumber, String xAxis, String yAxis, String zAxis)` 

- **起始版本**：5.0
- **说明**：

Set units for the x-, y- and z-axis of the coordinate system in given graphics window.

`ggbApplet.setAxisUnits(3, "cm","cm","cm²")`

#### `void setGridVisible(boolean flag)` 

- **起始版本**：3.0
- **说明**：

Shows or hides the coordinate grid in the graphics windows 1 and 2.

#### `void setGridVisible(int viewNumber, boolean flag)` 

- **起始版本**：5.0
- **说明**：

Shows or hides the coordinate grid in given graphics view  
graphics window.

#### `getGridVisible(int viewNumber)` 

- **起始版本**：5.0
- **说明**：

Returns true if grid is visible in given view. If view number is omitted, returns  
whether grid is visible in the first graphics view.

#### `getPerspectiveXML()` 

- **起始版本**：5.0
- **说明**：

Returns an XML representation of the current perspective.

#### `void setUndoPoint()` 

- **起始版本**：3.2
- **说明**：

Sets an undo point. Useful if you want the user to be able to undo that action of evalCommand  
eg if you have made an HTML button to act as a custom tool

#### `undo()` 

- **起始版本**：5.0
- **说明**：

Undoes one user action.

#### `redo()` 

- **起始版本**：5.0
- **说明**：

Redoes one user action.

#### `showToolBar(boolean show)` 

- **起始版本**：HTML5
- **说明**：

Sets visibility of toolbar

#### `setCustomToolBar(String toolbar)` 

- **起始版本**：5.0
- **说明**：

Sets the layout of the main toolbar, see toolbar  
reference for details

#### `addCustomTool(String iconURL, String name, String category, Function callback)` 

- **起始版本**：6.0 (Notes only)
- **说明**：

Adds a custom tool with given name and icon (https: or data: URL) to the Notes toolbox. The `callback` function is called when user selects the tool, it may show custom UI and/or use object creation APIs to create new objects. The `category` parameter may be one of `upload`, `link` or `more` and specifies in which category to show the new tool; if omitted, the `more` category is used.

#### `showMenuBar(boolean show)` 

- **起始版本**：HTML5
- **说明**：

Sets visibility of menu bar

#### `showAlgebraInput(boolean show)` 

- **起始版本**：HTML5
- **说明**：

Sets visibility of input bar

#### `showResetIcon(boolean show)` 

- **起始版本**：HTML5
- **说明**：

Sets visibility of reset icon

#### `enableRightClick(boolean enable)` 

- **起始版本**：5.0
- **说明**：

Enables or disables right click features

#### `enableLabelDrags(boolean enable)` 

- **起始版本**：5.0
- **说明**：

Enables or disables dragging object labels

#### `enableShiftDragZoom(boolean enable)` 

- **起始版本**：5.0
- **说明**：

Enables or disables zooming and dragging the view using mouse or keyboard

#### `enableCAS(boolean enable)` 

- **起始版本**：5.0
- **说明**：

Enables or disables CAS features (both the view and commands)

#### `enable3D(boolean enable)` 

- **起始版本**：5.0
- **说明**：

Enables or disables the 3D view

#### `void setPerspective(string perspective)` 

- **起始版本**：5.0
- **说明**：

Changes the open views, see  
SetPerspective Command for the string interpretation.

#### `setWidth(int width)` 

- **起始版本**：5.0 (HTML5)
- **说明**：

Change width of the applet (in pixels)

#### `setHeight(int height)` 

- **起始版本**：5.0 (HTML5)
- **说明**：

Change height of the applet (in pixels)

#### `setSize(int width, int height)` 

- **起始版本**：5.0 (HTML5)
- **说明**：

Change width and height of the applet (in pixels)

#### `recalculateEnvironments()` 

- **起始版本**：5.0 (HTML5)
- **说明**：

Update the applet after scaling by external CSS

#### `getEditorState()` 

- **起始版本**：5.0 (HTML5)
- **说明**：

Get state of the equation editor in algebra view (or in evaluator applet). Returns JSON  
object with `content` and optional fields (`caret` for graphing app, `eval` and `latex` for evaluator  
app)

#### `setEditorState(Object state)` 

- **起始版本**：5.0 (HTML5)
- **说明**：

Set state of the equation editor in algebra view (or in evaluator applet).  
The argument should be a JSON (object or string) with `content` and optional `caret` field.

#### `getGraphicsOptions(int viewId)` 

- **起始版本**：5.0 (HTML5)
- **说明**：

Get the graphics options for euclidian view specified by viewId. It  
returns a JSON (object or string) with `rightAngleStyle`, `pointCapturing`, `grid`, `gridIsBold`,  
`gridType`, `bgColor`, `gridColor`, `axesColor`, `axes`, `gridDistance`

#### `setGraphicsOptions(int viewId, Object options)` 

- **起始版本**：5.0 (HTML5)
- **说明**：

Set the graphics options for euclidian view specified by  
viewId. The second argument should be a JSON (object or string) with optional fields with `rightAngleStyle`,  
`pointCapturing`, `grid`, `gridIsBold`, `gridType`, `bgColor`, `gridColor`, `axesColor`,  
`axes`, `gridDistance`

#### `setAlgebraOptions(Object options)` 

- **起始版本**：5.0 (HTML5)
- **说明**：

Set the options for the algebra view. The argument should be a JSON  
(object or string) with field `sortBy`

#### `getViewProperties(int viewID)` 

- **起始版本**：6.0
- **说明**：

Returns properties of a view as JSON-encoded string.  
The object has several properties: `invXscale` and `invYscale` (number of graphics view units per pixel in x and y directions),  
`xMin` and `yMin` (minimal visible value on x-axis and y-axis respectively),  
`width` and `height` (size of the view in pixels),  
`left` and `top` (position of the view within the app frame).

## 事件监听器 

#### `void registerAddListener(JSFunction function)` 

- **起始版本**：3.0
- **说明**：

Registers a JavaScript function as an add listener for the applet’s construction. Whenever a new object is created in  
the GeoGebraApplet’s construction, the JavaScript function is called using the name of the newly created  
object as its single argument.

Example: First, register a listening JavaScript function:

ggbApplet.registerAddListener(myAddListenerFunction);

When an object "A" is created, the GeoGebra Applet will call the JavaScript function

myAddListenerFunction("A");

#### `void unregisterAddListener(JSFunction function)` 

- **起始版本**：3.0
- **说明**：

Removes a previously registered add listener, see  
registerAddListener()

#### `void registerRemoveListener(JSFunction function)` 

- **起始版本**：3.0
- **说明**：

Registers a JavaScript function as a remove listener for the applet’s construction. Whenever an object is deleted from  
the GeoGebraApplet’s construction, the JavaScript function is called using the name of the deleted object  
as its single argument. Note: when a construction is cleared, remove is not called for every single object, see  
registerClearListener().

Example: First, register a listening JavaScript function:

ggbApplet.registerRemoveListener(myRemoveListenerFunction);

When the object "A" is deleted, the GeoGebra Applet will call the JavaScript function

myRemoveListenerFunction("A");

#### `void unregisterRemoveListener(JSFunction function)` 

- **起始版本**：3.0
- **说明**：

Removes a previously registered remove listener, see  
registerRemoveListener()

#### `void registerUpdateListener(JSFunction function)` 

- **起始版本**：3.0
- **说明**：

Registers a JavaScript function as an update listener for the applet’s construction. Whenever any object is updated in  
the GeoGebraApplet’s construction, the JavaScript function is called using the name of the updated object  
as its single argument. Note: when you only want to listen for the updates of a single object use  
registerObjectUpdateListener() instead.

Example: First, register a listening JavaScript function:

ggbApplet.registerUpdateListener(myUpdateListenerFunction);

When the object "A" is updated, the GeoGebra Applet will call the JavaScript function

myUpdateListenerFunction("A");

#### `void unregisterUpdateListener(JSFunction function)` 

- **起始版本**：3.0
- **说明**：

Removes a previously registered update listener, see  
registerUpdateListener()

#### `void registerClickListener(JSFunction function)` 

- **起始版本**：5.0
- **说明**：

Registers a JavaScript function as a click listener for the  
applet’s construction. Whenever any object is clicked in the GeoGebraApplet’s construction, the JavaScript function  
is called using the name of the updated object as its single argument. Note: when you only want to listen  
for the updates of a single object use registerObjectClickListener() instead.

#### `void unregisterClickListener(JSFunction function)` 

- **起始版本**：3.0
- **说明**：

Removes a previously registered click listener, see  
registerClickListener()

#### `void registerObjectUpdateListener(String objName, JSFunction function)` 

- **起始版本**：3.0
- **说明**：

Registers a JavaScript function as an update listener for a single object. Whenever the object with the given name is  
updated, the JavaScript function is called using the name of the updated object as its single argument. If  
objName previously had a mapping JavaScript function, the old value is replaced. Note: all object updated listeners are  
unregistered when their object is removed or the construction is cleared, see registerRemoveListener() and  
registerClearListener().

Example: First, register a listening JavaScript function:

ggbApplet.registerObjectUpdateListener("A", myAupdateListenerFunction);

Whenever the object A is updated, the GeoGebra Applet will call the JavaScript function

myAupdateListenerFunction();

Note: an object update listener will still work after an object is renamed.

#### `void unregisterObjectUpdateListener(String objName)` 

- **起始版本**：3.0
- **说明**：

Removes a previously registered object update listener of the  
object with the given name, see registerObjectUpdateListener()

#### `void registerObjectClickListener(String objName, JSFunction function)` 

- **起始版本**：5.0
- **说明**：

Registers a JavaScript function as a click listener for a single object. Whenever the object with the given name is  
clicked, the JavaScript function is called using the name of the updated object as its single argument. If  
objName previously had a mapping JavaScript function, the old value is replaced. Note: all object click listeners are  
unregistered when their object is removed or the construction is cleared, see registerRemoveListener() and  
registerClearListener().

Example: First, register a listening JavaScript function:

ggbApplet.registerObjectClickListener("A", myAclickListenerFunction);

Whenever the object A is clicked, the GeoGebra Applet will call the JavaScript function

myAclickListenerFunction();

Note: an object click listener will still work after an object is renamed.

#### `void unregisterObjectClickListener(String objName)` 

- **起始版本**：5.0
- **说明**：

Removes a previously registered object click listener of the  
object with the given name, see registerObjectClickListener()

#### `void registerRenameListener(JSFunction function)` 

- **起始版本**：3.0
- **说明**：

Registers a JavaScript function as a rename listener for the applet’s construction. Whenever an object is renamed in the  
GeoGebraApplet’s construction, the JavaScript function is called using the old name and the new name of  
the renamed object as its two arguments.

Example: First, register a listening JavaScript function:

ggbApplet.registerRenameListener(myRenameListenerFunction);

When an object "A" is renamed to "B", the GeoGebra Applet will call the JavaScript function

myRenameListenerFunction("A", "B");

#### `void unregisterRenameListener(String objName)` 

- **起始版本**：3.0
- **说明**：

Removes a previously registered rename listener, see  
registerRenameListener()

#### `void registerClearListener(JSFunction function)` 

- **起始版本**：3.0
- **说明**：

Registers a JavaScript function as a clear listener for the applet’s construction. Whenever the construction in the  
GeoGebraApplet is cleared (i.e. all objects are removed), the JavaScript function is called using no  
arguments. Note: all update listeners are unregistered when a construction is cleared. See registerUpdateListener() and  
registerRemoveListener().

Example: First, register a listening JavaScript function:

ggbApplet.registerClearListener(myClearListenerFunction);

When the construction is cleared (i.e. after resetting a construction or opening a new construction file), the GeoGebra  
Applet will call the JavaScript function

myClearListenerFunction();

#### `void unregisterClearListener(JSFunction function)` 

- **起始版本**：3.0
- **说明**：

Removes a previously registered clear listener, see  
*registerClearListener()*

#### `void registerStoreUndoListener(JSFunction function)` 

- **起始版本**：4.4
- **说明**：

Registers a listener that is called (with no arguments)  
every time an undo point is created.

#### `void unregisterStoreUndoListener(JSFunction function)` 

- **起始版本**：4.4
- **说明**：

Removes previously registered listener for storing undo  
points, see registerStoreUndoListener

#### `void registerClientListener(JSFunction function)` 

- **起始版本**：5.0
- **说明**：

Registers a JavaScript function as a generic listener for the applet’s construction. The listener receives events as  
JSON objects of the form

`{type: "setMode", target:"", argument: "2"}` where `target` is the label of the construction element related to  
the event (if applicable), `argument` provides additional information based on the event type (e.g. the mode number  
for setMode event). Please refer to the list of client events below.

#### `void unregisterClientListener(JSFunction function)` 

- **起始版本**：5.0
- **说明**：

Removes previously registered client listener, see  
registerClientListener

### 客户端事件 

通过 `registerClientListener` 可观察以下客户端事件，事件以 JSON 对象形式传递：

| 事件类型 (Type)                                                                                          | 属性 (Attributes)                                                                              | 说明 (Description)                                                          |
| ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `addMacro`                                                                                           | `argument`: macro name                                                                       | when new macro is added                                                   |
| `addPolygon`                                                                                         | —                                                                                            | polygon construction started                                              |
| `addPolygonComplete`                                                                                 | `target`: polygon label                                                                      | polygon construction finished                                             |
| `algebraPanelSelected`                                                                               | —                                                                                            | Graphing / Geometry apps: algebra tab selected in sidebar                 |
| `deleteGeos`                                                                                         | —                                                                                            | multiple objects deleted                                                  |
| `deselect`                                                                                           | `target`: object name (for single object) or null (deselect all)                             | one or all objects removed from                                           |
| selection                                                                                            |                                                                                              |                                                                           |
| `dragEnd`                                                                                            | —                                                                                            | mouse drag ended                                                          |
| `dropdownClosed`                                                                                     | `target`: dropdown list name, `index` index of selected item (0 based)                       | dropdown list closed                                                      |
| `dropdownItemFocused`                                                                                | `target`: dropdown list name, `index` index of focused item (0 based)                        | dropdown list item                                                        |
| focused using mouse or keyboard                                                                      |                                                                                              |                                                                           |
| `dropdownOpened`                                                                                     | `target`: dropdown list name                                                                 | dropdown list opened                                                      |
| `editorKeyTyped`                                                                                     | —                                                                                            | key typed in editor (Algebra view of any app or standalone Evaluator app) |
| `editorStart`                                                                                        | `target:` object label if editing existing object                                            | user moves focus to the editor (Algebra view of any                       |
| app or standalone Evaluator app)                                                                     |                                                                                              |                                                                           |
| `editorStop`                                                                                         | `target`: object label if editing existing object                                            | user (Algebra view of any app or standalone                               |
| Evaluator app)                                                                                       |                                                                                              |                                                                           |
| `export`                                                                                             | `argument`: JSON encoded array including export format                                       | export started                                                            |
| `mouseDown`                                                                                          | `x`: mouse x-coordinate, `y`: mouse y-coordinate                                             | user pressed the mouse button                                             |
| `movedGeos`                                                                                          | `argument`: object labels                                                                    | multiple objects move ended                                               |
| `movingGeos`                                                                                         | `argument`: object labels                                                                    | multiple objects are being moved                                          |
| `openDialog`                                                                                         | `argument`: dialog ID                                                                        | dialog is opened (currently just for export dialog)                       |
| `openMenu`                                                                                           | `argument`: submenu ID                                                                       | main menu or one of its submenus were open                                |
| `pasteElms`                                                                                          | `argument`: pasted objects as XML                                                            | pasting multiple objects started                                          |
| `pasteElmsComplete`                                                                                  | —                                                                                            | pasting multiple objects ended                                            |
| `perspectiveChange`                                                                                  | —                                                                                            | perspective changed (e.g. a view was opened or closed)                    |
| `redo`                                                                                               | —                                                                                            | redo button pressed                                                       |
| `relationTool`                                                                                       | `argument`: HTML description of the object relation                                          | relation tool used                                                        |
| `removeMacro`                                                                                        | `argument`: custom tool name                                                                 | custom tool removed                                                       |
| `renameComplete`                                                                                     | —                                                                                            | object renaming complete (in case of chain renames)                       |
| `renameMacro`                                                                                        | `argument`: array [old name, new name]                                                       | custom tool was renamed                                                   |
| `select`                                                                                             | `target`: object label                                                                       | object added to selection                                                 |
| `setMode`                                                                                            | `argument`: mode number (see toolbar reference for details)                                  | app mode changed (e.g. a tool was selected)                               |
| `showNavigationBar`                                                                                  | `argument`: "true" or "false"                                                                | navigation bar visibility changed                                         |
| `showStyleBar`                                                                                       | `argument`: "true" or "false"                                                                | style bar visibility changed                                              |
| `sidePanelClosed`                                                                                    | —                                                                                            | side panel (where algebra view is in Graphing Calculator) closed          |
| `sidePanelOpened`                                                                                    | —                                                                                            | side panel (where algebra view is in Graphing Calculator) opened          |
| `tablePanelSelected`                                                                                 | —                                                                                            | table of values panel selected                                            |
| `toolsPanelSelected`                                                                                 | —                                                                                            | tools panel selected                                                      |
| `undo`                                                                                               | —                                                                                            | undo pressed                                                              |
| `updateStyle`                                                                                        | `target`: object label                                                                       | object style changed                                                      |
| `viewChanged2D`                                                                                      | `xZero`: horizontal pixel position of point (0,0), `yZero`: vertical pixel position of point |                                                                           |
| (0,0), `xscale`: ratio pixels / horizontal units, `yscale`: ratio pixels / vertical units, `viewNo`: |                                                                                              |                                                                           |
| graphics view number (1 or 2)                                                                        | graphics view dimensions changed by zooming or panning                                       |                                                                           |
| `viewChanged3D`                                                                                      | similar to 2D, e.g.                                                                          |                                                                           |
| `xZero: 0,yZero: 0,scale: 50,yscale: 50,viewNo: 512,zZero: -1.5,zscale: 50,xAngle: -40,zAngle: 24`   | 3D view                                                                                      |                                                                           |
| dimensions changed by zooming or panning                                                             |                                                                                              |                                                                           |

## GeoGebra 文件格式 

#### `void evalXML(String xmlString)` 

- **起始版本**：2.7
- **说明**：

Evaluates the given XML string and changes the current construction. Note: the  
construction is NOT cleared before evaluating the XML string.

#### `void setXML(String xmlString)` 

- **起始版本**：2.7
- **说明**：

Evaluates the given XML string and changes the current construction. Note: the  
construction is cleared before evaluating the XML string. This method could be used to load constructions.

#### `String getXML()` 

- **起始版本**：2.7
- **说明**：

Returns the current construction in GeoGebra’s XML format. This method could be used to save  
constructions.

#### `String getXML(String objName)` 

- **起始版本**：3.2
- **说明**：

Returns the GeoGebra XML string for the given object, i.e. only the <element> tag  
is returned.

#### `String getAlgorithmXML(String objName)` 

- **起始版本**：3.2
- **说明**：

For a dependent GeoElement objName the XML string of the parent algorithm  
and all its output objects is returned. For a free GeoElement objName "" is returned.

#### `String getFileJSON()` 

- **起始版本**：5.0
- **说明**：

Gets the current construction as JSON object including the XML and images

#### `String setFileJSON(Object content)` 

- **起始版本**：5.0
- **说明**：

Sets the current construction from a JSON (object or string) that includes XML  
and images (try getFileJSON for the precise format)

#### `String getBase64()` 

- **起始版本**：—
- **说明**：

Gets the current construction as a base64-encoded .ggb file

#### `String getBase64(function callback)` 

- **起始版本**：4.2
- **说明**：

Gets the current construction as a base64-encoded .ggb file asynchronously,  
passes as parameter to the callback function when ready. The callback function should take one parameter (the base64  
string).

#### `void setBase64(String [, function callback] )` 

- **起始版本**：4.0
- **说明**：

Sets the current construction from a base64-encoded .ggb file. If  
callback function is specified, it is called after the file is loaded.

## 杂项 

#### `void debug(String string)` 

- **起始版本**：3.2
- **说明**：

Prints the string to the Java Console

#### `String getVersion()` 

- **起始版本**：5.0
- **说明**：

Returns the version of GeoGebra

#### `void remove()` 

- **起始版本**：5.0
- **说明**：

Removes the applet and frees up memory

### 获取 API 对象 

```javascript
const ggb = new GGBApplet({
  appletOnLoad(ggbApi) {
    // ggbApi provides the applet API
  }
});
ggb.inject(document.body);
```

### 以模块方式获取 API 对象（ES6） 

```javascript
<script type="module">
    import {mathApps} from 'https://www.geogebra.org/apps/latest/web3d/web3d.nocache.mjs';
    mathApps.create({'width':'800', 'height':'600',
        'showAlgebraInput': 'true',
        'material_id':'MJWHp9en'})
        .inject(document.querySelector("#applet1"));
</script>
<div id="applet1"></div>
```

```javascript
mathApps.create({'appName':'graphing'})
    .inject(document.querySelector("#plot"))
    .getAPI().then(api => api.evalCommand('f(x)=sin(x)'));
```

## 方法索引（按字母排序）

- [addCustomTool](#addcustomtool) — 构造 / 用户界面
- [debug](#debug) — 杂项
- [deleteObject](#deleteobject) — 通用方法
- [enable3D](#enable3d) — 构造 / 用户界面
- [enableCAS](#enablecas) — 构造 / 用户界面
- [enableLabelDrags](#enablelabeldrags) — 构造 / 用户界面
- [enableRightClick](#enablerightclick) — 构造 / 用户界面
- [enableShiftDragZoom](#enableshiftdragzoom) — 构造 / 用户界面
- [evalCommand](#evalcommand) — 创建对象
- [evalCommandCAS](#evalcommandcas) — 创建对象
- [evalCommandGetLabels](#evalcommandgetlabels) — 创建对象
- [evalLaTex](#evallatex) — 创建对象
- [evalLaTeX](#evallatex-1) — 创建对象
- [evalXML](#evalxml) — GeoGebra 文件格式
- [exists](#exists) — 获取对象状态
- [exportPDF](#exportpdf) — 通用方法
- [exportSVG](#exportsvg) — 通用方法
- [getAlgorithmXML](#getalgorithmxml) — GeoGebra 文件格式
- [getBase64](#getbase64) — GeoGebra 文件格式
- [getBase64](#getbase64-1) — GeoGebra 文件格式
- [getCaption](#getcaption) — 获取对象状态
- [getCASObjectNumber](#getcasobjectnumber) — 获取对象状态
- [getColor](#getcolor) — 获取对象状态
- [getCommandString](#getcommandstring) — 获取对象状态
- [getDefinitionString](#getdefinitionstring) — 获取对象状态
- [getEditorState](#geteditorstate) — 构造 / 用户界面
- [getFileJSON](#getfilejson) — GeoGebra 文件格式
- [getFilling](#getfilling) — 获取对象状态
- [getGraphicsOptions](#getgraphicsoptions) — 构造 / 用户界面
- [getGridVisible](#getgridvisible) — 构造 / 用户界面
- [getLabelStyle](#getlabelstyle) — 获取对象状态
- [getLabelVisible](#getlabelvisible) — 获取对象状态
- [getLaTeXBase64](#getlatexbase64) — 获取对象状态
- [getLaTeXString](#getlatexstring) — 获取对象状态
- [getLayer](#getlayer) — 获取对象状态
- [getLineStyle](#getlinestyle) — 获取对象状态
- [getLineThickness](#getlinethickness) — 获取对象状态
- [getListValue](#getlistvalue) — 获取对象状态
- [getMode](#getmode) — 构造 / 用户界面
- [getObjectName](#getobjectname) — 获取对象状态
- [getObjectNumber](#getobjectnumber) — 获取对象状态
- [getObjectType](#getobjecttype) — 获取对象状态
- [getPerspectiveXML](#getperspectivexml) — 构造 / 用户界面
- [getPNGBase64](#getpngbase64) — 通用方法
- [getPointSize](#getpointsize) — 获取对象状态
- [getPointStyle](#getpointstyle) — 获取对象状态
- [getScreenshotBase64](#getscreenshotbase64) — 通用方法
- [getValue](#getvalue) — 获取对象状态
- [getValueString](#getvaluestring) — 获取对象状态
- [getVersion](#getversion) — 杂项
- [getViewProperties](#getviewproperties) — 构造 / 用户界面
- [getVisible](#getvisible) — 获取对象状态
- [getVisible](#getvisible-1) — 获取对象状态
- [getXcoord](#getxcoord) — 获取对象状态
- [getXML](#getxml) — GeoGebra 文件格式
- [getXML](#getxml-1) — GeoGebra 文件格式
- [getYcoord](#getycoord) — 获取对象状态
- [getZcoord](#getzcoord) — 获取对象状态
- [hideCursorWhenDragging](#hidecursorwhendragging) — 构造 / 用户界面
- [insertEmbed](#insertembed) — 创建对象
- [isAnimationRunning](#isanimationrunning) — 自动动画
- [isDefined](#isdefined) — 获取对象状态
- [isIndependent](#isindependent) — 通用方法
- [isInteractive](#isinteractive) — 获取对象状态
- [isMoveable](#ismoveable) — 通用方法
- [newConstruction](#newconstruction) — 构造 / 用户界面
- [openFile](#openfile) — 构造 / 用户界面
- [recalculateEnvironments](#recalculateenvironments) — 构造 / 用户界面
- [redo](#redo) — 构造 / 用户界面
- [refreshViews](#refreshviews) — 构造 / 用户界面
- [registerAddListener](#registeraddlistener) — 事件监听器
- [registerClearListener](#registerclearlistener) — 事件监听器
- [registerClickListener](#registerclicklistener) — 事件监听器
- [registerClientListener](#registerclientlistener) — 事件监听器
- [registerEmbedResolver](#registerembedresolver) — 通用方法
- [registerObjectClickListener](#registerobjectclicklistener) — 事件监听器
- [registerObjectUpdateListener](#registerobjectupdatelistener) — 事件监听器
- [registerRemoveListener](#registerremovelistener) — 事件监听器
- [registerRenameListener](#registerrenamelistener) — 事件监听器
- [registerStoreUndoListener](#registerstoreundolistener) — 事件监听器
- [registerUpdateListener](#registerupdatelistener) — 事件监听器
- [remove](#remove) — 杂项
- [renameObject](#renameobject) — 通用方法
- [reset](#reset) — 构造 / 用户界面
- [setAlgebraOptions](#setalgebraoptions) — 构造 / 用户界面
- [setAnimating](#setanimating) — 自动动画
- [setAnimationSpeed](#setanimationspeed) — 自动动画
- [setAuxiliary](#setauxiliary) — 通用方法
- [setAxesVisible](#setaxesvisible) — 构造 / 用户界面
- [setAxesVisible](#setaxesvisible-1) — 构造 / 用户界面
- [setAxisLabels](#setaxislabels) — 构造 / 用户界面
- [setAxisSteps](#setaxissteps) — 构造 / 用户界面
- [setAxisUnits](#setaxisunits) — 构造 / 用户界面
- [setBase64](#setbase64) — GeoGebra 文件格式
- [setCaption](#setcaption) — 通用方法
- [setColor](#setcolor) — 通用方法
- [setCoords](#setcoords) — 通用方法
- [setCoordSystem](#setcoordsystem) — 构造 / 用户界面
- [setCoordSystem](#setcoordsystem-1) — 构造 / 用户界面
- [setCustomToolBar](#setcustomtoolbar) — 构造 / 用户界面
- [setDisplayStyle](#setdisplaystyle) — 通用方法
- [setEditorState](#seteditorstate) — 构造 / 用户界面
- [setErrorDialogsActive](#seterrordialogsactive) — 构造 / 用户界面
- [setFileJSON](#setfilejson) — GeoGebra 文件格式
- [setFilling](#setfilling) — 通用方法
- [setFixed](#setfixed) — 通用方法
- [setGraphicsOptions](#setgraphicsoptions) — 构造 / 用户界面
- [setGridVisible](#setgridvisible) — 构造 / 用户界面
- [setGridVisible](#setgridvisible-1) — 构造 / 用户界面
- [setHeight](#setheight) — 构造 / 用户界面
- [setLabelStyle](#setlabelstyle) — 通用方法
- [setLabelVisible](#setlabelvisible) — 通用方法
- [setLayer](#setlayer) — 通用方法
- [setLayerVisible](#setlayervisible) — 通用方法
- [setLineStyle](#setlinestyle) — 通用方法
- [setLineThickness](#setlinethickness) — 通用方法
- [setListValue](#setlistvalue) — 通用方法
- [setMode](#setmode) — 构造 / 用户界面
- [setOnTheFlyPointCreationActive](#setontheflypointcreationactive) — 构造 / 用户界面
- [setPerspective](#setperspective) — 构造 / 用户界面
- [setPointCapture](#setpointcapture) — 构造 / 用户界面
- [setPointSize](#setpointsize) — 通用方法
- [setPointStyle](#setpointstyle) — 通用方法
- [setRepaintingActive](#setrepaintingactive) — 构造 / 用户界面
- [setRounding](#setrounding) — 构造 / 用户界面
- [setSize](#setsize) — 构造 / 用户界面
- [setTextValue](#settextvalue) — 通用方法
- [setTrace](#settrace) — 通用方法
- [setUndoPoint](#setundopoint) — 构造 / 用户界面
- [setValue](#setvalue) — 通用方法
- [setVisible](#setvisible) — 通用方法
- [setWidth](#setwidth) — 构造 / 用户界面
- [setXML](#setxml) — GeoGebra 文件格式
- [showAlgebraInput](#showalgebrainput) — 构造 / 用户界面
- [showAllObjects](#showallobjects) — 通用方法
- [showMenuBar](#showmenubar) — 构造 / 用户界面
- [showResetIcon](#showreseticon) — 构造 / 用户界面
- [showToolBar](#showtoolbar) — 构造 / 用户界面
- [startAnimation](#startanimation) — 自动动画
- [stopAnimation](#stopanimation) — 自动动画
- [String \[\] getAllObjectNames(\[String type\])](#string-getallobjectnames-string-type) — 获取对象状态
- [undo](#undo) — 构造 / 用户界面
- [unregisterAddListener](#unregisteraddlistener) — 事件监听器
- [unregisterClearListener](#unregisterclearlistener) — 事件监听器
- [unregisterClickListener](#unregisterclicklistener) — 事件监听器
- [unregisterClientListener](#unregisterclientlistener) — 事件监听器
- [unregisterObjectClickListener](#unregisterobjectclicklistener) — 事件监听器
- [unregisterObjectUpdateListener](#unregisterobjectupdatelistener) — 事件监听器
- [unregisterRemoveListener](#unregisterremovelistener) — 事件监听器
- [unregisterRenameListener](#unregisterrenamelistener) — 事件监听器
- [unregisterStoreUndoListener](#unregisterstoreundolistener) — 事件监听器
- [unregisterUpdateListener](#unregisterupdatelistener) — 事件监听器
- [writePNGtoFile](#writepngtofile) — 通用方法
