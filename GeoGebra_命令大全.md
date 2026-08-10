# GeoGebra 命令大全（手册整理 · 含使用方式）

> 来源：[GeoGebra 官方手册](https://geogebra.github.io/docs/manual/en/commands/)  
> 共整理 **765** 条命令分类条目，去重后 **502** 个独立命令，覆盖 **20** 个类别。每条命令均附【语法】与【说明/示例】，并链接至官方手册页面。

## 目录

- [3D 命令](#3d_commands)（53）
- [代数命令](#algebra_commands)（67）
- [图表命令](#chart_commands)（15）
- [圆锥曲线命令](#conic_commands)（32）
- [离散数学命令](#discrete_math_commands)（6）
- [函数与微积分命令](#functions_and_calculus_commands)（73）
- [几何命令](#geometry_commands)（64）
- [GeoGebra 命令](#geogebra_commands)（11）
- [列表命令](#list_commands)（39）
- [逻辑命令](#logic_commands)（11）
- [优化命令](#optimization_commands)（2）
- [概率命令](#probability_commands)（46）
- [脚本命令](#scripting_commands)（67）
- [表格命令](#spreadsheet_commands)（8）
- [统计命令](#statistics_commands)（69）
- [金融命令](#financial_commands)（5）
- [文本命令](#text_commands)（27）
- [变换命令](#transformation_commands)（6）
- [向量与矩阵命令](#vector_and_matrix_commands)（28）
- [CAS 专用命令](#cas_specific_commands)（136）

## 全部命令总览（去重，共 502 个独立命令）

- **AffineRatio** — 几何命令
- **Angle** — 3D 命令、几何命令
- **AngleBisector** — 几何命令
- **ANOVA** — 统计命令
- **Append** — 列表命令
- **ApplyMatrix** — 向量与矩阵命令
- **Arc** — 几何命令
- **Area** — 几何命令
- **AreCollinear** — 几何命令
- **AreConcurrent** — 几何命令
- **AreConcyclic** — 几何命令
- **AreCongruent** — 几何命令
- **AreEqual** — 代数命令、几何命令
- **AreParallel** — 几何命令
- **ArePerpendicular** — 几何命令
- **Assume** — 代数命令、CAS 专用命令
- **Asymptote** — 函数与微积分命令
- **AttachCopyToView** — 脚本命令
- **Axes** — 3D 命令、圆锥曲线命令
- **AxisStepX** — GeoGebra 命令
- **AxisStepY** — GeoGebra 命令
- **BarChart** — 图表命令
- **Barycenter** — 几何命令
- **Bernoulli** — 概率命令
- **BetaDist** — 概率命令
- **BinomialDist** — 概率命令、CAS 专用命令
- **Bottom** — 3D 命令
- **BoxPlot** — 图表命令
- **Button** — 脚本命令
- **CASLoaded** — GeoGebra 命令
- **Cauchy** — 概率命令、CAS 专用命令
- **Cell** — 表格命令
- **CellRange** — 表格命令
- **Center** — 3D 命令、圆锥曲线命令


- **CenterView** — 脚本命令
- **Centroid** — 几何命令
- **CFactor** — 代数命令、CAS 专用命令
- **CharacteristicPolynomial** — 向量与矩阵命令、CAS 专用命令
- **Checkbox** — 脚本命令
- **ChiSquared** — 概率命令、CAS 专用命令
- **ChiSquaredTest** — 概率命令、统计命令
- **CIFactor** — 代数命令、CAS 专用命令
- **Circle** — 3D 命令、圆锥曲线命令、几何命令
- **CircularArc** — 3D 命令、几何命令
- **CircularSector** — 3D 命令、几何命令
- **CircumcircularArc** — 3D 命令、几何命令
- **CircumcircularSector** — 3D 命令、几何命令
- **Circumference** — 3D 命令、圆锥曲线命令、几何命令
- **Classes** — 列表命令、统计命令
- **ClosestPoint** — 几何命令
- **ClosestPointRegion** — 几何命令
- **Coefficients** — 代数命令、圆锥曲线命令、函数与微积分命令、CAS 专用命令
- **Column** — 表格命令
- **ColumnName** — 表格命令
- **CommonDenominator** — 代数命令、CAS 专用命令
- **CompleteSquare** — 代数命令、CAS 专用命令
- **ComplexRoot** — 代数命令、函数与微积分命令、CAS 专用命令
- **Cone** — 3D 命令
- **Conic** — 圆锥曲线命令
- **ConjugateDiameter** — 圆锥曲线命令
- **ConstructionStep** — GeoGebra 命令
- **ContingencyTable** — 图表命令、统计命令、文本命令
- **ContinuedFraction** — 代数命令、文本命令
- **ConvexHull** — 离散数学命令
- **CopyFreeObject** — 脚本命令
- **Corner** — GeoGebra 命令
- **CorrelationCoefficient** — 统计命令
- **CountIf** — 列表命令、逻辑命令
- **Covariance** — 统计命令、CAS 专用命令
- **Cross** — 向量与矩阵命令、CAS 专用命令
- **CrossRatio** — 几何命令
- **CSolutions** — 代数命令、CAS 专用命令
- **CSolve** — 代数命令、CAS 专用命令
- **Cube** — 3D 命令
- **Cubic** — 函数与微积分命令、几何命令
- **Curvature** — 圆锥曲线命令、函数与微积分命令
- **CurvatureVector** — 函数与微积分命令、向量与矩阵命令
- **Curve** — 3D 命令、函数与微积分命令
- **Cylinder** — 3D 命令
- **DataFunction** — 函数与微积分命令、列表命令
- **Degree** — 代数命令、函数与微积分命令、CAS 专用命令
- **DelaunayTriangulation** — 离散数学命令
- **Delete** — 脚本命令、CAS 专用命令
- **Denominator** — 代数命令、函数与微积分命令、CAS 专用命令
- **Derivative** — 函数与微积分命令、CAS 专用命令
- **Determinant** — 向量与矩阵命令、CAS 专用命令
- **Difference** — 几何命令
- **Dilate (Enlarge)** — 变换命令
- **Dimension** — 向量与矩阵命令、CAS 专用命令
- **Direction** — 几何命令、向量与矩阵命令
- **Directrix** — 圆锥曲线命令
- **Distance** — 3D 命令、几何命令
- **Div** — 代数命令、CAS 专用命令
- **Division** — 代数命令、CAS 专用命令
- **Divisors** — 代数命令、CAS 专用命令
- **DivisorsList** — 代数命令、CAS 专用命令
- **DivisorsSum** — 代数命令、CAS 专用命令
- **Dodecahedron** — 3D 命令
- **Dot** — 向量与矩阵命令、CAS 专用命令
- **DotPlot** — 图表命令
- **DynamicCoordinates** — GeoGebra 命令
- **Eccentricity** — 圆锥曲线命令
- **Eigenvalues** — 向量与矩阵命令、CAS 专用命令
- **Eigenvectors** — 向量与矩阵命令、CAS 专用命令
- **Element** — 列表命令、向量与矩阵命令、CAS 专用命令
- **Eliminate** — 代数命令、CAS 专用命令
- **Ellipse** — 圆锥曲线命令
- **Ends** — 3D 命令
- **Envelope** — 几何命令
- **Erlang** — 概率命令
- **Execute** — 脚本命令
- **Expand** — 代数命令、CAS 专用命令
- **Exponential** — 概率命令、CAS 专用命令
- **ExportImage** — 脚本命令
- **ExtendedGCD** — 代数命令、CAS 专用命令
- **Extremum** — 函数与微积分命令
- **Factor** — 代数命令、函数与微积分命令、CAS 专用命令
- **Factors** — 代数命令、函数与微积分命令、CAS 专用命令
- **FDistribution** — 概率命令、CAS 专用命令
- **FillCells** — 表格命令
- **FillColumn** — 表格命令
- **FillRow** — 表格命令
- **First** — 列表命令、文本命令、CAS 专用命令
- **Fit** — 统计命令
- **FitExp** — 统计命令、CAS 专用命令
- **FitGrowth** — 统计命令
- **FitImplicit** — 统计命令
- **FitLine** — 统计命令
- **FitLineX** — 统计命令
- **FitLog** — 统计命令、CAS 专用命令
- **FitLogistic** — 统计命令
- **FitPoly** — 统计命令、CAS 专用命令
- **FitPow** — 统计命令、CAS 专用命令
- **FitSin** — 统计命令、CAS 专用命令
- **Flatten** — 列表命令
- **Focus** — 圆锥曲线命令
- **FormulaText** — 文本命令
- **FractionText** — 文本命令
- **Frequency** — 列表命令、统计命令
- **FrequencyPolygon** — 图表命令、统计命令
- **FrequencyTable** — 图表命令、统计命令、文本命令
- **FromBase** — 代数命令
- **Function** — 3D 命令、函数与微积分命令
- **FutureValue** — 金融命令
- **Gamma** — 概率命令、CAS 专用命令
- **GCD** — 代数命令、CAS 专用命令
- **GeometricMean** — 代数命令、统计命令
- **GetTime** — 脚本命令
- **GroebnerDegRevLex** — CAS 专用命令
- **GroebnerLex** — CAS 专用命令
- **GroebnerLexDeg** — CAS 专用命令
- **HarmonicMean** — 代数命令、统计命令
- **Height** — 3D 命令
- **HideLayer** — 脚本命令
- **Histogram** — 图表命令
- **HistogramRight** — 图表命令
- **Hyperbola** — 圆锥曲线命令
- **HyperGeometric** — 概率命令、CAS 专用命令
- **Icosahedron** — 3D 命令
- **Identity** — 向量与矩阵命令、CAS 专用命令
- **If** — 逻辑命令
- **IFactor** — 代数命令、CAS 专用命令
- **ImplicitCurve** — 函数与微积分命令
- **ImplicitDerivative** — 函数与微积分命令、CAS 专用命令
- **Incircle** — 3D 命令、圆锥曲线命令、几何命令
- **IndexOf** — 列表命令、文本命令
- **InfiniteCone** — 3D 命令
- **InfiniteCylinder** — 3D 命令
- **InflectionPoint** — 函数与微积分命令
- **InputBox** — 脚本命令
- **Insert** — 列表命令
- **Integral** — 函数与微积分命令、CAS 专用命令
- **IntegralBetween** — 函数与微积分命令、CAS 专用命令
- **IntegralSymbolic** — 函数与微积分命令、CAS 专用命令
- **InteriorAngles** — 3D 命令、几何命令
- **Intersect** — 3D 命令、函数与微积分命令、几何命令、CAS 专用命令
- **IntersectConic** — 3D 命令
- **Intersection** — 列表命令
- **IntersectPath** — 3D 命令、几何命令
- **InverseBeta** — 概率命令
- **InverseBinomial** — 概率命令
- **InverseBinomialMinimumTrials** — 概率命令
- **InverseCauchy** — 概率命令
- **InverseChiSquared** — 概率命令
- **InverseExponential** — 概率命令
- **InverseFDistribution** — 概率命令
- **InverseGamma** — 概率命令
- **InverseHyperGeometric** — 概率命令
- **InverseLaplace** — 函数与微积分命令、CAS 专用命令
- **InverseLogistic** — 概率命令
- **InverseLogNormal** — 概率命令
- **InverseNormal** — 概率命令
- **InversePascal** — 概率命令
- **InversePoisson** — 概率命令
- **InverseTDistribution** — 概率命令
- **InverseWeibull** — 概率命令
- **InverseZipf** — 概率命令
- **Invert** — 函数与微积分命令、向量与矩阵命令、CAS 专用命令
- **IsDefined** — 逻辑命令
- **IsFactored** — 代数命令、逻辑命令
- **IsInRegion** — 几何命令、逻辑命令
- **IsInteger** — 代数命令、逻辑命令
- **IsPrime** — 代数命令、逻辑命令、CAS 专用命令
- **IsTangent** — 几何命令、逻辑命令
- **IsVertexForm** — 函数与微积分命令、逻辑命令
- **Iteration** — 函数与微积分命令
- **IterationList** — 函数与微积分命令
- **Join** — 列表命令
- **JordanDiagonalization** — 向量与矩阵命令、CAS 专用命令
- **KeepIf** — 列表命令、逻辑命令
- **Laplace** — 函数与微积分命令、CAS 专用命令
- **Last** — 列表命令、文本命令、CAS 专用命令
- **LCM** — 代数命令、CAS 专用命令
- **LeftSide** — 代数命令、CAS 专用命令
- **LeftSum** — 函数与微积分命令
- **Length** — 函数与微积分命令、几何命令、文本命令、向量与矩阵命令、CAS 专用命令
- **LetterToUnicode** — 文本命令
- **Limit** — 函数与微积分命令、CAS 专用命令
- **LimitAbove** — 函数与微积分命令、CAS 专用命令
- **LimitBelow** — 函数与微积分命令、CAS 专用命令
- **Line** — 3D 命令、几何命令
- **LinearEccentricity** — 圆锥曲线命令
- **LineGraph** — 图表命令
- **Locus** — 几何命令
- **LocusEquation** — 几何命令
- **Logistic** — 概率命令
- **LogNormal** — 概率命令
- **LowerSum** — 函数与微积分命令
- **LUDecomposition** — 向量与矩阵命令、CAS 专用命令
- **MAD** — 统计命令
- **MajorAxis** — 圆锥曲线命令
- **MatrixRank** — 向量与矩阵命令、CAS 专用命令
- **Max** — 代数命令、函数与微积分命令、列表命令、统计命令、CAS 专用命令
- **Maximize** — 优化命令
- **Mean** — 代数命令、列表命令、统计命令、CAS 专用命令
- **MeanX** — 统计命令
- **MeanY** — 统计命令
- **Median** — 统计命令、CAS 专用命令
- **Midpoint** — 3D 命令、代数命令、圆锥曲线命令、几何命令
- **Min** — 代数命令、函数与微积分命令、列表命令、统计命令、CAS 专用命令
- **MinimalPolynomial** — 向量与矩阵命令、CAS 专用命令
- **Minimize** — 优化命令
- **MinimumSpanningTree** — 离散数学命令
- **MinorAxis** — 圆锥曲线命令
- **MixedNumber** — 代数命令、CAS 专用命令
- **Mod** — 代数命令、CAS 专用命令
- **Mode** — 统计命令
- **ModularExponent** — 代数命令、CAS 专用命令
- **Name** — GeoGebra 命令
- **NDerivative** — 函数与微积分命令
- **Net** — 3D 命令
- **NextPrime** — 代数命令、CAS 专用命令
- **NIntegral** — 函数与微积分命令、CAS 专用命令
- **NInvert** — 函数与微积分命令
- **Normal** — 概率命令、CAS 专用命令
- **Normalize** — 代数命令、函数与微积分命令、列表命令、统计命令
- **NormalQuantilePlot** — 图表命令
- **NSolutions** — 代数命令、CAS 专用命令
- **NSolve** — 代数命令、CAS 专用命令
- **NSolveODE** — 函数与微积分命令
- **Numerator** — 代数命令、函数与微积分命令、CAS 专用命令
- **Numeric** — 代数命令、CAS 专用命令
- **Object** — GeoGebra 命令
- **Octahedron** — 3D 命令
- **Ordinal** — 文本命令
- **OrdinalRank** — 列表命令
- **OsculatingCircle** — 圆锥曲线命令、函数与微积分命令
- **Pan** — 脚本命令
- **Parabola** — 圆锥曲线命令
- **Parameter** — 圆锥曲线命令
- **ParametricDerivative** — 函数与微积分命令
- **ParseToFunction** — 函数与微积分命令、脚本命令、文本命令
- **ParseToNumber** — 代数命令、脚本命令、文本命令
- **PartialFractions** — 代数命令、函数与微积分命令、CAS 专用命令
- **Pascal** — 概率命令、CAS 专用命令
- **PathParameter** — 圆锥曲线命令、函数与微积分命令、几何命令
- **Payment** — 金融命令
- **Percentile** — 统计命令
- **Perimeter** — 3D 命令、圆锥曲线命令、几何命令
- **Periods** — 金融命令
- **PerpendicularBisector** — 3D 命令、几何命令
- **PerpendicularLine** — 3D 命令、几何命令
- **PerpendicularPlane** — 3D 命令
- **PerpendicularVector** — 向量与矩阵命令、CAS 专用命令
- **PieChart** — 图表命令
- **Plane** — 3D 命令
- **PlaneBisector** — 3D 命令
- **PlaySound** — 脚本命令
- **PlotSolve** — 代数命令、函数与微积分命令、CAS 专用命令
- **Point** — 3D 命令、几何命令
- **PointIn** — 3D 命令、几何命令
- **PointList** — 列表命令
- **Poisson** — 概率命令、CAS 专用命令
- **Polar** — 圆锥曲线命令
- **Polygon** — 3D 命令、几何命令
- **Polyline** — 3D 命令、几何命令
- **Polynomial** — 代数命令、函数与微积分命令、CAS 专用命令
- **PresentValue** — 金融命令
- **PreviousPrime** — 代数命令、CAS 专用命令
- **PrimeFactors** — 代数命令、CAS 专用命令
- **Prism** — 3D 命令
- **Product** — 代数命令、函数与微积分命令、列表命令、统计命令、CAS 专用命令
- **Prove** — 几何命令
- **ProveDetails** — 几何命令
- **Pyramid** — 3D 命令
- **QRDecomposition** — 向量与矩阵命令、CAS 专用命令
- **Quartile1** — 统计命令
- **Quartile3** — 统计命令
- **Radius** — 3D 命令、圆锥曲线命令、几何命令
- **RandomBetween** — 代数命令、概率命令、CAS 专用命令
- **RandomBinomial** — 概率命令、CAS 专用命令
- **RandomDiscrete** — 概率命令
- **RandomElement** — 列表命令、CAS 专用命令
- **RandomNormal** — 概率命令、CAS 专用命令
- **RandomPointIn** — 几何命令、列表命令、概率命令
- **RandomPoisson** — 概率命令、CAS 专用命令
- **RandomPolynomial** — 代数命令、函数与微积分命令、概率命令、CAS 专用命令
- **RandomUniform** — 概率命令、CAS 专用命令
- **Rate** — 金融命令
- **Rationalize** — 代数命令、CAS 专用命令
- **Ray** — 3D 命令、几何命令
- **ReadText** — 脚本命令、文本命令
- **RectangleSum** — 函数与微积分命令
- **ReducedRowEchelonForm** — 向量与矩阵命令、CAS 专用命令
- **Reflect** — 变换命令
- **Relation** — 逻辑命令
- **RemovableDiscontinuity** — 函数与微积分命令
- **Remove** — 列表命令
- **RemoveUndefined** — 列表命令
- **Rename** — 脚本命令
- **Repeat** — 脚本命令
- **ReplaceAll** — 文本命令
- **ResidualPlot** — 图表命令
- **Reverse** — 列表命令
- **RightSide** — 代数命令、CAS 专用命令
- **RigidPolygon** — 几何命令
- **Root** — 代数命令、函数与微积分命令、CAS 专用命令
- **RootList** — 函数与微积分命令、列表命令、CAS 专用命令
- **RootMeanSquare** — 统计命令
- **Roots** — 函数与微积分命令
- **Rotate** — 变换命令
- **RotateText** — 文本命令
- **Row** — 表格命令
- **RSquare** — 统计命令
- **RunClickScript** — 脚本命令
- **RunUpdateScript** — 脚本命令
- **Sample** — 列表命令、统计命令、CAS 专用命令
- **SampleSD** — 统计命令、CAS 专用命令
- **SampleSDX** — 统计命令
- **SampleSDY** — 统计命令
- **SampleVariance** — 统计命令、CAS 专用命令
- **ScientificText** — 文本命令
- **SD** — 统计命令、CAS 专用命令
- **SDX** — 统计命令
- **SDY** — 统计命令
- **Sector** — 圆锥曲线命令、几何命令
- **Segment** — 3D 命令、几何命令
- **SelectedElement** — 列表命令
- **SelectedIndex** — 列表命令
- **SelectObjects** — 脚本命令
- **Semicircle** — 圆锥曲线命令、几何命令
- **SemiMajorAxisLength** — 圆锥曲线命令
- **SemiMinorAxisLength** — 圆锥曲线命令
- **Sequence** — 列表命令、CAS 专用命令
- **SetActiveView** — 脚本命令
- **SetAxesRatio** — 脚本命令
- **SetBackgroundColor** — 脚本命令
- **SetCaption** — 脚本命令
- **SetColor** — 脚本命令
- **SetConditionToShowObject** — 脚本命令
- **SetConstructionStep** — GeoGebra 命令、脚本命令
- **SetCoords** — 脚本命令
- **SetDecoration** — 脚本命令
- **SetDynamicColor** — 脚本命令
- **SetFilling** — 脚本命令
- **SetFixed** — 脚本命令
- **SetImage** — 脚本命令
- **SetLabelMode** — 脚本命令
- **SetLayer** — 脚本命令
- **SetLevelOfDetail** — 脚本命令
- **SetLineOpacity** — 脚本命令
- **SetLineStyle** — 脚本命令
- **SetLineThickness** — 脚本命令
- **SetPerspective** — 脚本命令
- **SetPointSize** — 脚本命令
- **SetPointStyle** — 脚本命令
- **SetSeed** — 脚本命令
- **SetSpinSpeed** — 脚本命令
- **SetTooltipMode** — 脚本命令
- **SetTrace** — 脚本命令
- **SetValue** — 脚本命令
- **SetViewDirection** — 脚本命令
- **SetVisibleInView** — 脚本命令
- **Shear** — 变换命令
- **ShortestDistance** — 离散数学命令
- **ShowAxes** — 脚本命令
- **ShowGrid** — 脚本命令
- **ShowLabel** — 脚本命令
- **ShowLayer** — 脚本命令
- **Shuffle** — 列表命令、统计命令、CAS 专用命令
- **Side** — 3D 命令
- **SigmaXX** — 统计命令
- **SigmaXY** — 统计命令
- **SigmaYY** — 统计命令
- **Simplify** — 代数命令、函数与微积分命令、文本命令、CAS 专用命令
- **Slider** — 脚本命令
- **Slope** — 几何命令
- **SlopeField** — 函数与微积分命令
- **SlowPlot** — GeoGebra 命令
- **Solutions** — 代数命令、CAS 专用命令
- **Solve** — 代数命令、CAS 专用命令
- **SolveCubic** — 代数命令、CAS 专用命令
- **SolveODE** — 函数与微积分命令、CAS 专用命令
- **SolveQuartic** — 代数命令、CAS 专用命令
- **Sort** — 列表命令
- **Spearman** — 统计命令
- **Sphere** — 3D 命令
- **Spline** — 函数与微积分命令
- **Split** — 文本命令
- **StartAnimation** — 脚本命令
- **StartRecord** — 脚本命令
- **StemPlot** — 图表命令
- **StepGraph** — 图表命令
- **StickGraph** — 图表命令
- **Stretch** — 变换命令
- **Substitute** — 代数命令、CAS 专用命令
- **Sum** — 代数命令、函数与微积分命令、列表命令、统计命令、CAS 专用命令
- **SumSquaredErrors** — 统计命令
- **SurdText** — 文本命令
- **Surface** — 3D 命令
- **SVD** — 向量与矩阵命令、CAS 专用命令
- **Sxx** — 统计命令
- **Sxy** — 统计命令
- **Syy** — 统计命令
- **TableText** — 文本命令
- **Take** — 列表命令、文本命令、CAS 专用命令
- **Tangent** — 圆锥曲线命令、函数与微积分命令、几何命令
- **TaylorPolynomial** — 函数与微积分命令、CAS 专用命令
- **TDistribution** — 概率命令、CAS 专用命令
- **Tetrahedron** — 3D 命令
- **Text** — 文本命令
- **TextToUnicode** — 文本命令
- **TiedRank** — 列表命令
- **TMean2Estimate** — 统计命令
- **TMeanEstimate** — 统计命令
- **ToBase** — 代数命令
- **ToComplex** — 函数与微积分命令、向量与矩阵命令、CAS 专用命令
- **ToExponential** — 函数与微积分命令、CAS 专用命令
- **ToolImage** — GeoGebra 命令
- **Top** — 3D 命令
- **ToPoint** — 函数与微积分命令、CAS 专用命令
- **ToPolar** — 函数与微积分命令、向量与矩阵命令、CAS 专用命令
- **Translate** — 变换命令
- **Transpose** — 向量与矩阵命令、CAS 专用命令
- **TrapezoidalSum** — 函数与微积分命令
- **TravelingSalesman** — 离散数学命令
- **TriangleCenter** — 几何命令
- **TriangleCurve** — 函数与微积分命令、几何命令
- **Triangular** — 概率命令
- **TrigCombine** — 函数与微积分命令
- **TrigExpand** — 函数与微积分命令
- **TrigSimplify** — 函数与微积分命令
- **Trilinear** — 几何命令
- **TTest** — 统计命令
- **TTest2** — 统计命令
- **TTestPaired** — 统计命令
- **Turtle** — 脚本命令
- **TurtleBack** — 脚本命令
- **TurtleDown** — 脚本命令
- **TurtleForward** — 脚本命令
- **TurtleLeft** — 脚本命令
- **TurtleRight** — 脚本命令
- **TurtleUp** — 脚本命令
- **Type** — 圆锥曲线命令、几何命令
- **UnicodeToLetter** — 文本命令
- **UnicodeToText** — 文本命令
- **Uniform** — 概率命令
- **Union** — 几何命令、列表命令
- **Unique** — 列表命令、CAS 专用命令
- **UnitPerpendicularVector** — 向量与矩阵命令、CAS 专用命令
- **UnitVector** — 向量与矩阵命令、CAS 专用命令
- **UpdateConstruction** — 脚本命令
- **UpperSum** — 函数与微积分命令
- **Variance** — 统计命令、CAS 专用命令
- **Vector** — 向量与矩阵命令
- **Vertex** — 3D 命令、代数命令、圆锥曲线命令、几何命令
- **VerticalText** — 文本命令
- **Volume** — 3D 命令
- **Voronoi** — 离散数学命令
- **Weibull** — 概率命令、CAS 专用命令
- **Zip** — 列表命令
- **Zipf** — 概率命令、CAS 专用命令
- **ZMean2Estimate** — 统计命令
- **ZMean2Test** — 统计命令
- **ZMeanEstimate** — 统计命令
- **ZMeanTest** — 统计命令
- **ZoomIn** — 脚本命令
- **ZoomOut** — 脚本命令
- **ZProportion2Estimate** — 统计命令
- **ZProportion2Test** — 统计命令
- **ZProportionEstimate** — 统计命令
- **ZProportionTest** — 统计命令

## 3D 命令

> 共 53 个命令

### Angle

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Angle/>

**语法：**

```
Angle( <Object> )
Angle( <Vector>, <Vector> )
Angle( <Line>, <Line> )
Angle( <Line>, <Plane> )
Angle( <Plane>, <Plane> )
Angle( <Point>, <Apex>, <Point> )
Angle( <Point>, <Apex>, <Angle> )
Angle( <Point>, <Point>, <Point>, <Direction> )
```

**说明 / 示例：**

Conic: Returns the angle of twist of a conic section’s major axis (see command Axes).  
Angle(x²/4+y²/9=1) yields 90° or 1.57 if the default angle unit is radians.  
It is not possible to change the Angle Unit to Radian in GeoGebra 5.0 Web and Tablet App Version.  
Vector: Returns the angle between the x‐axis and given vector.  
Angle(Vector((1, 1))) yields 45° or the corresponding value in radians.  
Point: Returns the angle between the x‐axis and the position vector of the given point.  
Angle((1, 1)) yields 45° or the corresponding value in radians.  
Number: Converts the number into an angle (result in [0,360°] or [0,2π] depending on the default angle unit).  
Angle(20) yields 65.92° when the default unit for angles is degrees.  
Polygon: Creates all angles of a polygon in mathematically positive orientation (counter clockwise).  
Angle(Polygon((4, 1), (2, 4), (1, 1))) yields 56.31°, 52.13° and 71.57° or the corresponding values in  
radians.  
If the polygon was created in counter clockwise orientation, you get the interior angles. If the polygon was created in  
clockwise orientation, you get the exterior angles.  
Returns the angle between two vectors (result in [0,360°] or [0,2π] depending on the default angle unit).  
Angle(Vector((1, 1)), Vector((2, 5))) yields 23.2° or the corresponding value in radians.  
Returns the angle between the direction vectors of two lines (result in [0,360°] or [0,2π] depending on the default  
angle unit).  
Angle(y = x + 2, y = 2x + 3) yields 18.43° or the corresponding value in radians.  
Angle(Line((-2, 0, 0), (0, 0, 2)), Line((2, 0, 0), (0, 0, 2))) yields 90° or the corresponding value in  
radians.  
and in CAS View :  
Angle(x + 2, 2x + 3) yields (acos \left( 3 \cdot \frac{\sqrt{10}}{10} \right)).  
Define f(x) := x + 2 and g(x) := 2x + 3 then command Angle(f(x), g(x)) yields (acos \left(3  
\cdot \frac{\sqrt{10}}{10} \right)).  
Returns the angle between the line and the plane.  
Angle(Line((1, 2, 3),(-2, -2, 0)), z = 0) yields 30.96° or the corresponding value in radians.  
Returns the angle between the two given planes.  
Angle(2x - y + z = 0, z = 0) yields 114.09° or the corresponding value in radians.  
Returns the angle defined by the given points (result in [0,360°] or [0,2π] depending on the default angle unit).  
Angle((1, 1), (1, 4), (4, 2)) yields 56.31° or the corresponding value in radians.  
Returns the angle of size α drawn from point with apex.  
Angle((0, 0), (3, 3), 30°) yields 30° and the point (1.9, -1.1).  
The point Rotate( <Point>, <Angle>, <Apex> ) is created as well.  
Returns the angle defined by the points and the given Direction, that may be a line or a plane (result in [0,360°]  
or [0,2π] depending on the default angle unit).  
Angle((1, -1, 0),(0, 0, 0),(-1, -1, 0), zAxis) yields 270° and  
Angle((-1, -1, 0),(0, 0, 0),(1, -1, 0), zAxis) yields 90° or the corresponding values in radians.  
Using a Direction allows to bypass the standard display of angles in 3D which can be set as just [0,180°] or  
[180°,360°], so that given three points A, B, C in 3D the commands Angle(A, B, C) and  
Angle(C, B, A) return their real measure instead of the one restricted to the set intervals.  
See also Angle and  
Angle  
with Given Size tools.

### Axes

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Axes/>

**语法：**

```
Axes( <Conic> )
Axes( <Quadric> )
```

**说明 / 示例：**

Returns the equations of the major and minor axes of a conic section.  
See also MajorAxis and MinorAxis commands.  
Creates the 3 axes of the given quadric.  
Axes(x^2 + y^2 + z^2= 3) returns the three lines  
a: X = (0, 0, 0) + λ (1, 0, 0), b: X = (0, 0, 0) + λ (0, 1, 0) and c: X = (0, 0, 0) + λ (0, 0, 1)  
Specifically:  
if the given quadric is a cylinder, the command yields the two axes of the bottom circle and the rotation axis.  
if the given quadric is a sphere, the command yields the three axes parallel to the coordinate system axes.

### Bottom

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Bottom/>

**语法：**

```
Bottom( <Quadric> )
```

**说明 / 示例：**

Creates the bottom of the limited quadric.  
Bottom(cylinder) yields a circle.  
See also Top Command, Ends Command and Side  
Command.

### Center

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Center/>

**语法：**

```
Center( <Conic> )
Center( <Quadric> )
```

**说明 / 示例：**

This command differs among variants of English:  
Center (US)  
Centre (UK + Aus)  
Returns the center of a circle, ellipse, or hyperbola.  
Center(x^2 + 4 y^2 + 2x - 8y + 1 = 0) (,  
: Centre(x^2 + 4 y^2 + 2x - 8y + 1 = 0)) returns point A = (-1, 1)  
See also  
Midpoint or Center (,  
: Midpoint or Centre) tool .  
Creates the center of a quadric (e.g. sphere, cone, etc.).  
Center(x^2 + (y-1)^2 + (z-2)^2 = 1) yields (0, 1, 2)

### Circle

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Circle/>

**语法：**

```
Circle( <Point>, <Radius Number> )
Circle( <Point>, <Segment> )
Circle( <Point>, <Point> )
Circle( <Point>, <Point>, <Point> )
Circle( <Line>, <Point> )
Circle( <Point>, <Radius>, <Direction> )
Circle( <Point>, <Point>, <Direction> )
```

**说明 / 示例：**

Yields a circle with given center and radius.  
Yields a circle with given center and radius equal to the length of the given segment.  
Yields a circle with given center through a given point.  
Yields a circle through the three given points (if they do not lie on the same line).  
See also Compass,  
Circle with Center through Point,  
Circle with Center and Radius, and Circle through 3 Points tools.  
Creates a circle with line as axis and through the point.  
Creates a circle with center, radius, and axis parallel to direction, which can be a line, vector or plane.  
Creates a circle with center, through a point, and axis parallel to direction.  
In order to avoid the ambiguity line/plane of notations in 2D and 3D, don’t use equations like x = 0 or y = 0 for the Direction.  
For example, you want the Direction to be the plane x = 0, use an expression like x + 0y + 0z = 0 instead.  
See also Circle with Axis through Point and Circle with Center, Radius and Direction tools.

### CircularArc

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/CircularArc/>

**语法：**

```
CircularArc( <Midpoint>, <Point A>, <Point B> )
```

**说明 / 示例：**

Creates a circular arc with midpoint between the two points.  
The arc length is displayed in Algebra View.  
Point B does not have to lie on the arc.  
See also  
Circular Arc tool.

### CircularSector

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/CircularSector/>

**语法：**

```
CircularSector( <Midpoint>, <Point A>, <Point B> )
```

**说明 / 示例：**

Creates a circular sector with midpoint between the two points.  
The sector area is displayed in Algebra View  
Point B does not have to lie on the arc of the sector.  
See also  
Circular Sector tool.

### CircumcircularArc

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/CircumcircularArc/>

**语法：**

```
CircumcircularArc( <Point>, <Point>, <Point> )
```

**说明 / 示例：**

Creates a circular arc through three points, where the first point is the starting point and the third point is the  
endpoint of the circumcircular arc.  
See also  
Circumcircular Arc tool.

### CircumcircularSector

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/CircumcircularSector/>

**语法：**

```
CircumcircularSector( <Point>, <Point>, <Point> )
```

**说明 / 示例：**

Creates a circular sector whose arc runs through the three points, where the first point is the starting point and the  
third point is the endpoint of the arc.  
See also  
Circumcircular Sector through Three Points tool.

### Circumference

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Circumference/>

**语法：**

```
Circumference(Conic)
```

**说明 / 示例：**

If the given conic is a circle or ellipse, this command returns its circumference. Otherwise the result is undefined.  
Circumference(x^2 + 2y^2 = 1) yields 5.4.  
See also Perimeter command.

### Cone

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Cone/>

**语法：**

```
Cone( <Circle>, <Height> )
Cone( <Point>, <Point>, <Radius> )
Cone( <Point>, <Vector>, <Angle α> )
```

**说明 / 示例：**

Creates a cone with given base and height.  
Creates a cone with vertex (second point), circle center (first point) and given radius.  
Creates an infinite cone with given point as vertex, axis of symmetry parallel to the given vector and apex angle 2α.  
This command yields undefined if angle ≥ (\frac{\pi}{2}).  
See also InfiniteCone command, the Cone tool and the Extrude to Pyramid or Cone tool, that  
operates by dragging or selecting a circle and entering altitude to create a right circular cone.

### Cube

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Cube/>

**语法：**

```
Cube( <Square> )
Cube( <Point>, <Point>, <Direction> )
Cube( <Point>, <Point>, <Point>)
Cube( <Point>, <Point>)
```

**说明 / 示例：**

Creates a cube having as base the given square.  
Creates a cube having the segment between the two points as an edge.  
The other vertices are uniquely determined by the given direction, that should be one of:  
a vector, a segment, a line, a ray orthogonal to the segment, or  
a polygon, a plane parallel to the segment.  
The created cube will have:  
a face with the segment as an edge in a plane orthogonal to the given vector/segment/line/ray, or  
a face with the segment as an edge in a plane parallel to the polygon/plane.  
Creates a cube with three (adjacent) points of the first face. The points have to start a square for the cube to be  
defined.  
Creates a cube with two (adjacent) points of the first face, and the third point automatically created on a circle, so  
that the cube can rotate around its first edge.  
Cube(A, B) is a shortcut for Cube(A, B, C) with C = Point(Circle(B, Distance(A, B), Segment(A, B))).  
See also Tetrahedron, Octahedron,  
Icosahedron, Dodecahedron commands.

### Curve

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Curve/>

**语法：**

```
Curve( <Expression>, <Expression>, <Parameter Variable>, <Start Value>, <End Value> )
Curve( <Expression> , <Expression> , <Expression> , <Parameter Variable> , <Start Value> , <End Value> )
```

**说明 / 示例：**

Yields the Cartesian parametric curve for the given x-expression (first <Expression>) and  
y-expression (second <Expression>) (using parameter variable) within the given interval [Start Value, End  
Value].  
Curve(2 cos(t), 2 sin(t), t, 0, 2π) creates a circle with radius 2 around the origin of the coordinate system.  
Yields the 3D Cartesian parametric curve for the given x-expression (first <Expression>), y-expression (second  
<Expression>) and z-expression (third <Expression>) (using parameter variable) within the given interval [Start  
Value, End Value].  
Curve(cos(t), sin(t), t, t, 0, 10π) creates a 3D spiral.  
End Value must be greater than or equal to Start Value and both must be finite.  
x, y and z are not allowed as parameter variables.  
See Curves for details, also see the Derivative Command and the  
Parametric Derivative Command.

### Cylinder

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Cylinder/>

**语法：**

```
Cylinder( <Circle>, <Height> )
Cylinder( <Point>, <Point>, <Radius> )
```

**说明 / 示例：**

Creates a cylinder with given base and given height.  
Creates a cylinder with given radius and with given points as the centers of the top and bottom.  
See also the InfiniteCylinder command and the  
Cylinder and  
Extrude to Prism or Cylinder tools.

### Distance

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Distance/>

**语法：**

```
Distance( <Point>, <Object> )
Distance( <Line>, <Line> )
Distance( <Plane>, <Plane> )
```

**说明 / 示例：**

Yields the shortest distance between a point and an object.  
Distance((2, 1), x^2 + (y - 1)^2 = 1) yields 1  
Distance((2, 1, 2), (1, 3, 0)) yields 3  
Let f be a function and A be a point. Distance(A, f) yields the distance between A and (x(A), f(x(A))), that is the distance between point A and ClosestPoint(f, A).  
The command works for points, segments, lines, conics, functions, and implicit curves. For functions, it uses a  
numerical algorithm which works better for polynomials.  
Yields the distance between two lines.  
Distance(y = x + 3, y = x + 1) yields 1.41  
Distance(y = 3x + 1, y = x + 1) yields 0  
Let a: X = (-4, 0, 0) + λ\*(4, 3, 0) and b: X = (0, 0, 0) + λ\*(0.8, 0.6, 0).  Distance(a, b) yields 2.4  
The distance between intersecting lines is 0. Thus, this command is only interesting for parallel lines.  
Yields the distance between the two planes.  
Let eq1: x + y + 2z = 1 and eq2: 2x + 2y + 4z = -2.  Distance(eq1, eq2) yields 0.82  
The distance between intersecting planes is 0. Thus, this command is only meaningful for parallel planes.  
See also  
Distance or Length tool .

### Dodecahedron

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Dodecahedron/>

**语法：**

```
Dodecahedron( <Regular pentagon> )
Dodecahedron( <Point>, <Point>, <Direction> )
Dodecahedron( <Point>, <Point>, <Point>)
Dodecahedron( <Point>, <Point>)
```

**说明 / 示例：**

Creates a dodecahedron having the given regular pentagon as base.  
Creates a dodecahedron having the segment between two points as an edge.  
The other vertices are univocally determined by the given direction, that needs to be:  
a vector, a segment, a line, a ray orthogonal to the segment, or  
a polygon, a plane parallel to the segment.  
The created dodecahedron will have:  
a face with the segment as an edge in a plane orthogonal to the given vector/segment/line/ray, or  
a face with the segment as an edge in a plane parallel to the polygon/plane.  
Creates a dodecahedron with three (adjacent) points of the first face. The points have to start a regular pentagon for  
the dodecahedron to be defined.  
Creates a dodecahedron with two (adjacent) points of the first face, and the third point automatically created on a  
circle, so that the dodecahedron can rotate around its first edge.  
Dodecahedron(A, B) is a shortcut for Dodecahedron(A, B, C) with C = Point(Circle(((1 - sqrt(5)) A + (3 + sqrt(5)) B) /  
4, Distance(A, B) sqrt(10 + 2sqrt(5)) / 4, Segment(A, B))).  
See also Cube, Tetrahedron,  
Icosahedron, Octahedron commands.

### Ends

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Ends/>

**语法：**

```
Ends( <Quadric> )
```

**说明 / 示例：**

Creates the top and the bottom of the limited quadric.  
Ends( cylinder ) yields two circles.  
Ends( cone ) yields a circle and the cone end (point).  
See also Top Command, Bottom Command and  
Side Command.

### Function

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Function/>

**语法：**

```
Function( <List of Numbers> )
Function( <Expression>, <Parameter Variable 1>, <Start Value>, <End Value>, <Parameter Variable 2>, <Start Value>, <End Value> )
```

**说明 / 示例：**

Yields the following function: The first two numbers determine the start x-value and the end x-value. The rest of  
the numbers are the y-values of the function in between in equal distances.  
Function[{2, 4, 0, 1, 0, 1, 0}] yields a triangular wave between x = 2 and x = 4.  
Function[{-3, 3, 0, 1, 2, 3, 4, 5}] yields a linear equation with slope = 1 between x = -3 and x = 3.  
Function(Function, Start x-value, End x-value)  
Restricts the visualization of the given function to the interval [Start x-value, End x-value].  
Function(x + 2, 1, 2) restricts the visualization of the graph of the function y = x + 2 to the interval [1, 2].  
Restricts the visualization of the representative surface of a function of two variables in 3D space.  
The expression a(x, y) = x + 0y creates a function of two variables, whose graph in 3D space is the  
plane z = a(x, y) = x.Function[u, u, 0, 3, v, 0, 2] creates the function of two  
variables b(u, v) = u, whose graph in 3D space is the rectangle Polygon[(0, 0, 0), (3, 0, 3),  
(3, 2, 3), (0, 2, 0)] contained in plane z = a(x,y) = x.

### Height

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Height/>

**语法：**

```
Height( <Solid> )
Height( <Cone> ) calculates the "oriented" height of the given cone.
Height( <Cylinder> ) calculates the "oriented" height of the given cylinder.
Height( <Polyhedron> ) calculates the "oriented" height of the given solid polyhedron.
```

**说明 / 示例：**

Calculates the "oriented" height of the given solid.

### Icosahedron

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Icosahedron/>

**语法：**

```
Icosahedron( <Equilateral Triangle> )
Icosahedron( <Point>, <Point>, <Direction> )
Icosahedron( <Point>, <Point>, <Point>)
Icosahedron( <Point>, <Point>)
```

**说明 / 示例：**

Creates an icosahedron having as base the given equilateral triangle.  
Creates an icosahedron having the segment between the two points as an edge.  
The other vertices are univocally determined by the given direction, that needs to be:  
a vector, a segment, a line, a ray orthogonal to the segment, or  
a polygon, a plane parallel to the segment.  
The created icosahedron will have:  
a face with the segment as an edge in a plane orthogonal to the given vector/segment/line/ray, or  
a face with the segment as an edge in a plane parallel to the polygon/plane.  
Creates an icosahedron with the three points of the first face. The points have to draw an equilateral triangle for  
the icosahedron to be defined.  
Creates an icosahedron with the two points of the first face, and the third point automatically created on a circle,  
so that the icosahedron can rotate around its first edge.  
Icosahedron(A, B) is a shortcut for Icosahedron(A, B, C) with C = Point(Circle(Midpoint(A, B), Distance(A, B) sqrt(3) /  
2, Segment(A, B))).  
See also Cube, Tetrahedron,  
Octahedron, Dodecahedron commands.

### Incircle

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Incircle/>

**语法：**

```
Incircle( <Point>, <Point>, <Point> )
```

**说明 / 示例：**

Returns Incircle of the triangle formed by the  
three Points.  
Let O=(0, 0), A=(3, 0) and B=(0, 5) be three points: Incircle(O, A, B) yields (x - 1.08)² + (y - 1.08)² =  
1.18 in Algebra View and draws the  
corresponding circle in Graphics  
View.

### InfiniteCone

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/InfiniteCone/>

**语法：**

```
InfiniteCone( <Point>, <Vector>, <Angle α> )
InfiniteCone( <Point>, <Point>, <Angle α> )
InfiniteCone( <Point>, <Line>, <Angle α> )
```

**说明 / 示例：**

Creates an infinite cone with given point as vertex, axis of symmetry parallel to the given vector and apex angle  
2α.  
Creates an infinite cone with given first point as vertex, line through two points as axis of symmetry and apex angle  
2α.  
Creates an infinite cone with given point as vertex, axis of symmetry parallel to given line and apex angle 2α.  
If you enter the angle without the degree symbol, you will get the apex angle in radian.  
See also the Cone command and  
Cone tool.

### InfiniteCylinder

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/InfiniteCylinder/>

**语法：**

```
InfiniteCylinder( <Line>, <Radius> )
InfiniteCylinder( <Point>, <Vector>, <Radius > )
InfiniteCylinder( <Point>, <Point>, <Radius> )
```

**说明 / 示例：**

Creates an infinite cylinder with given radius and given line as an axis of symmetry.  
InfiniteCylinder( xAxis, 2 ) creates an infinite cylinder with radius 2 and with the x-axis as axis of symmetry.  
Creates an infinite cylinder with given radius and with axis of symmetry through a given point parallel to the vector.  
Creates an infinite cylinder with given radius and with line through two points as an axis of symmetry.  
See also the Cylinder command and Cylinder tool.

### InteriorAngles

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/InteriorAngles/>

**语法：**

```
InteriorAngles( <Polygon> )
```

**说明 / 示例：**

Creates all the interior angles of the given polygon.  
See also Angle command and Angle tool.

### Intersect

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Intersect/>

**语法：**

```
Intersect( <Object>, <Object> )
Intersect( <Object>, <Object>, <Index of Intersection Point> )
Intersect( <Object>, <Object>, <Initial Point> )
Intersect( <Function>, <Function>, <Start x-Value>, <End x-Value> )
Intersect( <Curve 1>, <Curve 2>, <Parameter 1>, <Parameter 2> )
Intersect( <Function>, <Function> )
Intersect( <Line> , <Object> ) creates the intersection point(s) of a line and a plane, segment, polygon, conic,
Intersect( <Plane> , <Object> ) creates the intersection point(s) of a plane and segment, polygon, conic, etc.
Intersect( <Conic>, <Conic> ) creates the intersection point(s) of two conics
Intersect( <Plane>, <Plane> ) creates the intersection line of two planes
Intersect( <Plane>, <Polyhedron> ) creates the polygon(s) intersection of a plane and a polyhedron.
Intersect( <Sphere>, <Sphere> ) creates the circle intersection of two spheres
Intersect( <Plane>, <Quadric> ) creates the conic intersection of the plane and the quadric (sphere, cone,
```

**说明 / 示例：**

Yields the intersection points of two objects.  
Let a: -3x + 7y = -10 be a line and c: x^2 + 2y^2 = 8 be an ellipse. Intersect(a, c) yields the  
intersection points E = (-1.02, -1.87) and F = (2.81, -0.22) of the line and the ellipse.  
Intersect(y = x + 3, Curve(t, 2t, t, 0, 10)) yields A=(3, 6).  
Intersect(Curve(2s, 5s, s,-10, 10), Curve(t, 2t, t, -10, 10)) yields A=(0, 0).  
Yields the nth intersection point of two objects. Each object must be a line, conic, polynomial function or implicit  
curve.  
Let a(x) = x^3 + x^2 - x be a function and b: -3x + 5y = 4 be a line. Intersect(a, b, 2) yields the  
intersection point C = (-0.43, 0.54) of the function and the line.  
Yields an intersection point of two objects by using a numerical, iterative method with initial point.  
Let a(x) = x^3 + x^2 - x be a function, b: -3x + 5y = 4 be a line, and C = (0, 0.8) be the initial point.  
Intersect(a, b, C) yields the intersection point D = (-0.43, 0.54) of the function and the line by using a  
numerical, iterative method.  
Yields the intersection points numerically for the two functions in the given interval.  
Let f(x) = x^3 + x^2 - x and g(x) = 4 / 5 + 3 / 5 x be two functions. Intersect(f, g, -1, 2) yields  
the intersection points A = (-0.43, 0.54) and B = (1.1, 1.46) of the two functions in the interval [ -1, 2 ].  
Finds one intersection point using a numerical, iterative method starting at the given parameters.  
Let a = Curve(cos(t), sin(t), t, 0, π) and b = Curve(cos(t) + 1, sin(t), t, 0, π).  
Intersect(a, b, 0, 2) yields the intersection point A = (0.5, 0.87).  
CAS Syntax  
Yields a list containing the intersection points of two objects.  
Let f(x):= x^3 + x^2 - x and g(x):= x be two functions. Intersect(f(x), g(x)) yields the intersection  
points list: {(1, 1), (0, 0), (-2, -2)} of the two functions.  
etc.  
cylinder, …)  
to get all the intersection points in a list you can use eg {Intersect(a,b)}  
See also IntersectConic and IntersectPath  
commands.  
See also  
Intersect tool.

### IntersectConic

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/IntersectConic/>

**语法：**

```
IntersectConic( <Plane>, <Quadric> )
IntersectConic( <Quadric>, <Quadric> )
```

**说明 / 示例：**

Intersects the plane with the quadric.  
Returns a conic defined in case where the intersection is actually a conic.  
IntersectConic(sphere1, sphere2) creates the intersection conic of two spheres.  
See also Intersect and IntersectPath commands.

### IntersectPath

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/IntersectPath/>

**语法：**

```
IntersectPath( <Line>, <Polygon> )
IntersectPath( <Polygon>, <Polygon> )
IntersectPath( <Plane>, <Polygon> )
IntersectPath( <Plane>, <Quadric> )
```

**说明 / 示例：**

Creates the intersection path between line and polygon.  
IntersectPath(a, triangle) creates a segment between the first and second intersection point of line a and  
polygon triangle.  
Creates the intersection polygon between two given polygons.  
IntersectPath(quadrilateral, triangle) creates a new polygon as intersection of the two given polygons.  
The new polygon can either be a quadrilateral, a pentagon or a hexagon. This depends on the position of the vertices of  
the given polygons.  
Creates the intersection path between plane and polygon.  
IntersectPath(a, triangle) creates a segment between the first and second intersection point of plane a and  
polygon triangle in the plane of the polygon.  
Creates the intersection path between plane and quadric.  
IntersectPath(a, sphere) creates a circle as intersection between plane a and quadric sphere.  
See also Intersect and IntersectConic commands.

### Line

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Line/>

**语法：**

```
Line( <Point>, <Point> )
Line( <Point>, <Parallel Line> )
Line( <Point>, <Direction Vector> )
```

**说明 / 示例：**

Creates a line through two points A and B.  
Creates a line through the given point parallel to the given line.  
Creates a line through the given point with direction vector v.  
See also Line and  
Parallel Line  
tools.  
You can also use a parametric syntax to create a line eg X = (1, 2) + r (2, 3) or  
X = (1, 2, 3) + r (2, 3, 4)

### Midpoint

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Midpoint/>

**语法：**

```
Midpoint( <Segment> )
Midpoint( <Conic> )
Midpoint( <Interval> )
Midpoint( <Point>, <Point> )
Midpoint( <Quadric> )
```

**说明 / 示例：**

Returns the midpoint of the segment.  
Let s = Segment((1, 1), (1, 5)). Midpoint(s) yields (1, 3).  
Returns the center of the conic.  
Midpoint(x^2 + y^2 = 4) yields (0, 0).  
Returns the midpoint of the interval (as number).  
Midpoint(2 < x < 4) yields 3.  
Returns the midpoint of two points.  
Midpoint((1, 1), (5, 1)) yields (3, 1).  
Returns the midpoint of the given quadric (e.g. sphere, cone, etc.)  
Midpoint(x^2 + y^2 + z^2 = 1) yields (0, 0, 0).  
See also  
Midpoint or Center tool.

### Net

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Net/>

**语法：**

```
Net( <Polyhedron> , <Number> )
Net( <Polyhedron>, <Number>, <Face>, <Edge>, <Edge>, … )
```

**说明 / 示例：**

Creates the net of a convex polyhedron, on the plane containing the face used for its construction. The number is used  
to define the progress of the unfolding procedure, and needs to be between 0 and 1. The net is totally unfold when the  
given number is 1.  
The net of a cube is displayed as Latin cross.  
Applicable only to cubes (for the moment), allows you to create different nets of a cube, by specifying the face and  
edges that need to be cut to create the net.  
To explore the different configurations of the net of a cube, see this  
example file on GeoGebra.  
See also Net tool.

### Octahedron

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Octahedron/>

**语法：**

```
Octahedron( <Equilateral Triangle> )
Octahedron( <Point>, <Point>, <Direction> )
Octahedron( <Point>, <Point>, <Point>)
Octahedron( <Point>, <Point>)
```

**说明 / 示例：**

Creates an octahedron having as base the given equilateral triangle.  
Creates an octahedron having the segment between the two points as an edge.  
The other vertices are univocally determined by the given direction, that needs to be:  
a vector, a segment, a line, a ray orthogonal to the segment, or  
a polygon, a plane parallel to the segment.  
The created octahedron will have:  
a face with the segment as an edge in a plane orthogonal to the given vector/segment/line/ray, or  
a face with the segment as an edge in a plane parallel to the polygon/plane.  
Creates an octahedron with the three points of the first face. The points have to draw an equilateral triangle for the  
octahedron to be defined.  
Creates an octahedron with the two points of the first face, and the third point automatically created on a circle, so  
that the octahedron can rotate around its first edge.  
Octahedron(A, B) is a shortcut for Octahedron(A, B, C) with C = Point(Circle(Midpoint(A, B), Distance(A, B) sqrt(3) / 2,  
Segment(A, B))).  
See also Cube, Tetrahedron,  
Icosahedron, Dodecahedron commands.

### Perimeter

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Perimeter/>

**语法：**

```
Perimeter( <Polygon> )
Perimeter( <Conic> )
Perimeter( <Locus> )
```

**说明 / 示例：**

Returns the perimeter of the polygon.  
Perimeter(Polygon((1, 2), (3, 2), (4, 3))) yields 6.58.  
If the given conic is a circle or ellipse, this command returns its perimeter. Otherwise the result is undefined.  
Perimeter(x^2 + 2y^2 = 1) yields 5.4.  
If the given locus is finite, this command returns its approximate perimeter. Otherwise the result is undefined.  
See also Circumference command.

### PerpendicularBisector

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/PerpendicularBisector/>

**语法：**

```
PerpendicularBisector( <Segment> )
PerpendicularBisector( <Point>, <Point> )
PerpendicularBisector( <Point>, <Point>, <Direction>)
```

**说明 / 示例：**

Yields the perpendicular bisector of a segment.  
Yields the perpendicular bisector of a line segment between two points.  
Yields the perpendicular bisector of a line segment between two points which is perpendicular to the direction.  
<Direction> can either be a vector, an axis, a line or a segment.  
See also  
Perpendicular Bisector tool.

### PerpendicularLine

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/PerpendicularLine/>

**语法：**

```
PerpendicularLine( <Point>, <Line> )
PerpendicularLine( <Point>, <Segment> )
PerpendicularLine( <Point>, <Vector> )
PerpendicularLine( <Point>, <Plane> )
PerpendicularLine( <Line> , <Line> )
PerpendicularLine( <Point>, <Direction>, <Direction> )
PerpendicularLine( <Point>, <Line>, <Context> )
PerpendicularLine( <Point>, <Line>, <Plane> ) creates a perpendicular line to the given line through the point and
PerpendicularLine( <Point>, <Line>, space ) creates a perpendicular line to the given line through the point. The
```

**说明 / 示例：**

Creates a line through the point perpendicular to the given line.  
Let c: -3x + 4y = -6 be a line and A = (-2, -3) a point. PerpendicularLine(A, c) yields the line d:  
-4x - 3y = 17.  
For 3D objects a third argument is added to this command to specify the behavior: if 2D view is active, plane z=0 is  
used as third argument, if 3D view is active, space is used instead. See PerpendicularLine( <Point>, <Line>, <Context>  
) further below for details.  
Creates a line through the point perpendicular to the given segment.  
Let c be the segment between the two points A = (-3, 3) and B = (0, 1). PerpendicularLine(A, c) yields the  
line d: -3x + 2y = 15.  
Creates a line through the point perpendicular to the given vector.  
Let u = Vector((5, 3), (1, 1)) and A = (-2, 0) a point. PerpendicularLine(A, u) yields the line c: 2x

- y = -4.    
  Creates a perpendicular line to the plane through the given point.    
  Creates a perpendicular line to the given lines through the intersection point of the two lines.    
  Creates a perpendicular line to the given directions (that can be lines or vectors) through the given point.    
  Creates a perpendicular line to the line through the point and depending on the context.    
  parallel to the plane.    
  two lines have an intersection point. This command yields undefined if the point is on the line in 3D.    
  See also    
  Perpendicular Line tool.

### PerpendicularPlane

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/PerpendicularPlane/>

**语法：**

```
PerpendicularPlane( <Point>, <Line> )
PerpendicularPlane( <Point>, <Vector> )
```

**说明 / 示例：**

Creates a plane through the given point, perpendicular to the given line.  
Creates a plane through the given point, perpendicular to the given vector.  
See also  
Perpendicular Plane Tool.

### Plane

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Plane/>

**语法：**

```
Plane( <Polygon> )
Plane( <Conic> )
Plane( <Point>, <Plane> )
Plane( <Point>, <Line> )
Plane( <Line> , <Line> )
Plane( <Point>, <Point>, <Point> )
Plane( <Point>, <Vector>, <Vector> )
```

**说明 / 示例：**

Creates the plane containing the given polygon.  
Creates the plane containing the conic.  
Creates the plane through the given point, parallel to the given plane.  
Creates the plane through the given point and line.  
Creates the plane through the lines (that must be intersecting or parallel to each other).  
Creates the plane through the given points.  
Creates the plane through the given point and having as normal vector the cross product of the given vectors (that must not be collinear).  
See also  
Plane through 3 Points and Plane tools.

### PlaneBisector

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/PlaneBisector/>

**语法：**

```
PlaneBisector( <Point> , <Point> )
PlaneBisector( <Segment> )
```

**说明 / 示例：**

Creates the plane orthogonal bisector between the two points.  
Creates the plane orthogonal bisector of the segment.

### Point

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Point/>

**语法：**

```
Point( <Object> )
Point( <Object>, <Parameter> )
Point( <Point>, <Vector> )
Point( <List> )
```

**说明 / 示例：**

Returns a point on the geometric object. The resulting point can be moved along the  
path.  
Returns a point on the geometric object with given path parameter.  
Creates a new point by adding the vector to the given point.  
Converts a list containing two numbers into a Point.  
Point({1, 2}) yields (1, 2).  
See also Point tool.  
See also Points and vectors

### PointIn

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/PointIn/>

**语法：**

```
PointIn( <Region> )
```

**说明 / 示例：**

Returns a point restricted to given region.  
See also  
Attach / Detach Point Tool.

### Polygon

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Polygon/>

**语法：**

```
Polygon( <Point>, …, <Point> )
Polygon( <Point>, <Point>, <Number of Vertices> )
Polygon( <List of Points> )
Polygon( <Point>, <Point>, <Number of Vertices n>, <Direction> )
```

**说明 / 示例：**

Returns a polygon defined by the given points.  
Polygon((1, 1), (3, 0), (3, 2), (0, 4)) yields a quadrilateral.  
Creates a regular polygon with n vertices.  
Polygon((1, 1), (4, 1), 6) yields a hexagon.  
Returns a polygon defined by the points in the list.  
Polygon({(0, 0), (2, 1), (1, 3)}) yields a triangle.  
Creates a regular polygon with n vertices, and directed by the direction (e.g. a plane to which the polygon will  
be parallel, if possible).  
See also Polygon and  
Regular Polygon tools.

### Polyline

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Polyline/>

**语法：**

```
Polyline( <List of Points> )
Polyline( <Point>, …, <Point> )
```

**说明 / 示例：**

Creates an open polygonal chain (i.e. a connected series of segments) having the initial vertex in the first point of  
the list, and the final vertex in the last point of the list.  
The polygonal chain length is displayed in the Algebra View.  
Creates an open polygonal chain (i.e. a connected series of segments) having the initial vertex in the first entered  
point, and the final vertex in the last entered point.  
The polygonal chain length is displayed in the Algebra View.  
It is also possible to create a discontinuous polygonal:  
Polyline((1, 3), (4, 3), (?,?), (6, 2), (4, -2), (2, -2)) yields the value 9.47 in  
Algebra View, and the corresponding  
polygonal in Graphics View.  
See also Polygon command.

### Prism

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Prism/>

**语法：**

```
Prism( <Point>, <Point>, … )
Prism( <Polygon>, <Point> )
Prism( <Polygon>, <Height value> )
```

**说明 / 示例：**

Returns a prism defined by the given points.  
Prism(A, B, C, D) creates the prism with base ABC and top DEF. The vectors AD, BE, CF are equal.  
Creates a prism with the given polygon as base and the point as first top point.  
Prism(poly1, A) creates a prism with base poly1 and top point A.  
Creates a right prism with the polygon as base and given height.  
Prism(poly1, 3) creates a prism with base poly1 and height 3.  
See also Prism and  
Extrude to Prism tools.

### Pyramid

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Pyramid/>

**语法：**

```
Pyramid( <Point>, <Point>, …)
Pyramid( <Polygon>, <Point> )
Pyramid( <Polygon>, <Height> )
```

**说明 / 示例：**

Returns a pyramid defined by the given points.  
Pyramid(A, B, C, D) creates the pyramid with base ABC and apex D.  
Creates a pyramid with the given polygon as base and the point as apex.  
Pyramid(poly1, A) creates a pyramid with base poly1 and apex A.  
Returns a centered pyramid defined by the polygon as base and given height.  
Pyramid(poly1, 3) creates a centered pyramid with base poly1 and height 3.  
See also Pyramid and  
Extrude  
to Pyramid tools.

### Radius

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Radius/>

**语法：**

```
Radius( <Conic> )
```

**说明 / 示例：**

Returns the radius of a conic.  
Returns the radius of a circle c (e.g. c:(x - 1)² + (y - 1)² = 9) Radius(c) yields a = 3.  
Returns the radius of a circle formula Radius((x - 2)² + (y - 2)² = 16) yields a = 4.

### Ray

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Ray/>

**语法：**

```
Ray( <Start Point>, <Point> )
Ray( <Start Point>, <Direction Vector> )
```

**说明 / 示例：**

Creates a ray starting at a point through a point.  
Creates a ray starting at the given point which has the direction vector.  
When computing intersections with other objects, only intersections lying on the ray are considered. To change this,  
you can use Outlying Intersections option.  
See also Ray tool.

### Segment

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Segment/>

**语法：**

```
Segment( <Point>, <Point> )
Segment( <Point>, <Length> )
```

**说明 / 示例：**

This command differs among variants of English:  
Interval (Aus)  
Segment (UK + US)  
Creates a segment between two points.  
Creates a segment with the given starting point and length, as well as the end point of the segment.  
When computing intersections with other objects, only intersections lying on the segment are considered. To change  
this, you can use Outlying Intersections option.  
See also Segment and  
Segment_with_Given_Length tools.

### Side

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Side/>

**语法：**

```
Side( <Quadric> )
```

**说明 / 示例：**

Creates the side of the limited quadric.  
Side( cylinder ) creates the curved surface area of the cylinder.  
See also Top Command, Bottom Command and  
Ends Command.

### Sphere

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Sphere/>

**语法：**

```
Sphere( <Point>, <Radius> )
Sphere( <Point>, <Point> )
```

**说明 / 示例：**

Creates a sphere with center and radius.  
Creates a sphere with center in the first point through the second point.  
Sphere((0, 0, 0), (1, 1, 1)) yields x² + y² + z² = 3  
See also Sphere with Center through Point Tool  
and  
Sphere with Center and Radius Tool.

### Surface

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Surface/>

**语法：**

```
Surface( <Expression>, <Expression>, <Expression>, <Parameter Variable 1>, <Start Value>, <End Value>, <Parameter Variable 2>, <Start Value>, <End Value> )
Surface( <Function>, <Angle> )
Surface( <Curve>, <Angle>, <Line>)
```

**说明 / 示例：**

Yields the Cartesian parametric 3D surface for the given x-expression (first <Expression>), y-expression (second  
<Expression>) and z-expression (third <Expression>), using two <Parameter Variables> within the given intervals  
[<Start Value>, <End Value>].  
Let r and R be two positive real numbers:  
Surface((R + r cos( u)) cos(v) , (R + r cos( u)) sin(v) , r sin(u ), u, 0, 2 π , v, 0, 2 π) creates the torus  
generated by a circle of radius r whose center rotates about zAxis at a distance R.  
End Value must be greater than or equal to Start Value and both must be finite.  
x, y and z are not allowed as parameter variables.  
Creates a surface of revolution, rotating the given Function from 0 to given Angle around the x-axis.  
Creates a surface of revolution, rotating the Curve from 0 to given Angle around the Line.

### Tetrahedron

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Tetrahedron/>

**语法：**

```
Tetrahedron( <Equilateral Triangle> )
Tetrahedron( <Point>, <Point>, <Direction> )
Tetrahedron( <Point>, <Point>, <Point>)
Tetrahedron( <Point>, <Point>)
```

**说明 / 示例：**

Creates a tetrahedron having as base the given equilateral triangle.  
Creates a tetrahedron having the segment between the two points as an edge.  
The other vertices are univocally determined by the given direction, that needs to be:  
a vector, a segment, a line, a ray orthogonal to the segment, or  
a polygon, a plane parallel to the segment.  
The created tetrahedron will have:  
a face with the segment as an edge in a plane orthogonal to the given vector/segment/line/ray, or  
a face with the segment as an edge in a plane parallel to the polygon/plane.  
Creates a tetrahedron with the three points of the first face. The points have to draw an equilateral triangle for the  
tetrahedron to be defined.  
Creates a tetrahedron with the two points of the first face, and the third point automatically created on a circle, so  
that the tetrahedron can rotate around its first edge.  
Tetrahedron(A, B) is a shortcut for Tetrahedron(A, B, C) with C = Point(Circle(Midpoint(A, B), Distance(A, B) sqrt(3) /  
2, Segment(A, B))).  
See also Cube, Octahedron,  
Icosahedron, Dodecahedron commands.

### Top

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Top/>

**语法：**

```
Top( <Quadric> )
```

**说明 / 示例：**

Creates the top of the limited quadric.  
Top( cylinder ) yields a circle.  
Top( cone ) yields the cone end (point).  
See also Bottom Command, Ends Command and  
Side Command.

### Vertex

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Vertex/>

**语法：**

```
Vertex( <Conic> )
Vertex( <Inequality> )
Vertex( <Polygon> )
Vertex( <Polygon>, <Index n> )
Vertex( <Segment>, <Index> )
```

**说明 / 示例：**

Returns (all) vertices of the conic section.  
Returns the points of intersection of the borders.  
Vertex((x + y < 3) && (x - y > 1)) returns point A = (2, 1).  
{Vertex((x + y < 3) ∧ (x - y > 1) && (y > - 2))} returns list1 = {(2, 1), (5, -2), (-1, -2)}.  
Vertex((y > x²) ∧ (y < x)) returns two points A = (0, 0) and B = (1, 1).  
{Vertex((y > x²) ∧ (y < x))} returns list1 = {(0, 0), (1, 1)}.  
Returns (all) vertices of the polygon.  
Returns n-th vertex of the polygon.  
To get the vertices of the objects polygon / conic / inequality in a list, use {Vertex(Object)}.  
Returns the start-point (Index = 1) or end-point (Index = 2) of the Segment.

### Volume

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Volume/>

**语法：**

```
Volume( <Solid> )
Volume( <Pyramid> ) calculates the volume of the given pyramid.
Volume( <Prism> ) calculates the volume of the given prism.
Volume( <Cone> ) calculates the volume of the given cone.
Volume( <Cylinder> ) calculates the volume of the given cylinder.
```

**说明 / 示例：**

Calculates the volume of the given solid.  
See also Volume tool.

## 代数命令

> 共 67 个命令

### AreEqual

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/AreEqual/>

**语法：**

```
AreEqual( <Object>, <Object> )
```

**说明 / 示例：**

Decides if the objects are equal.  
Normally this command computes the result numerically. This behavior can be changed by using the  
Prove command.  
AreEqual(Circle((0, 0),1),x^2+y^2=1) yields true since the two circles have the same center and radius.  
AreEqual(Segment((1, 2), (3, 4)), Segment((3, 4), (1, 6))) is different from  
Segment((1, 2), (3, 4)) == Segment((3, 4), (1, 6)) as the latter compares just the lengths  
See also AreCollinear, AreConcyclic,  
AreConcurrent, AreCongruent,  
ArePerpendicular, AreParallel,  
IsTangent commands.

### Assume

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Assume/>

**语法：**

```
Assume( <Condition>, <Expression> )
```

**说明 / 示例：**

CAS Syntax  
Evaluates the expression according to the condition  
Assume(a > 0, Integral(exp(-a x), 0, infinity)) yields 1 / a.  
Assume(x>0 && n>0, Solve(log(n^2*(x/n)^lg(x))=log(x^2), x)) yields {x = 100, x = n}  
Assume(x<2,Simplify(sqrt(x-2sqrt(x-1)))) yields -sqrt(x - 1) + 1  
Assume(x>2,Simplify(sqrt(x-2sqrt(x-1)))) yields sqrt(x - 1) - 1  
Assume(k>0, Extremum(k*3*x^2/4-2*x/2)) yields ( \left{ \left(\frac{2}{3 k}, -\frac{1}{3 k} \right)\right} )  
Assume(k>0, InflectionPoint(0.25 k x^3 - 0.5x^2 + k)) yields ( \left{ \left(\frac{2}{3 k}, \frac{27k^{3} - 4}{27 k^{2}} \right) \right} )  
See also Solve Command.

### CFactor

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/CFactor/>

**语法：**

```
CFactor( <Expression> )
CFactor( <Expression>, <Variable> )
```

**说明 / 示例：**

This command differs among variants of English:  
CFactor (US)  
CFactorise (UK + Aus)  
CAS Syntax  
Factorizes a given expression, allowing for complex factors.  
CFactor(x^2 + 4) yields (x + 2 ί) (x - 2 ί), the factorization of x2 + 4.  
Factorizes an expression with respect to a given variable, allowing for complex factors.  
CFactor(a^2 + x^2, a) yields (ί x + a) (- ί x + a), the factorization of a2 + x2 with respect to a.  
CFactor(a^2 + x^2, x) yields (x + ί a) (x - ί a), the factorization of a2 + x2 with respect to x.  
This command factors expressions over the Complex Rational Numbers. To  
factor over rational numbers, see the Factor Command.

### CIFactor

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/CIFactor/>

**语法：**

```
CIFactor( <Expression> )
CIFactor( <Expression>, <Variable> )
```

**说明 / 示例：**

CAS Syntax  
Factors over the complex irrationals.  
CIFactor(x^2 + x + 1) returns ( \left( x + \frac{-ί \sqrt{3} + 1}{2} \right) \left( x + \frac{ί \sqrt{3}

- 1}{2} \right))    
  Factors over the complex irrationals with respect to a given variable.    
  CIFactor(a^2 + a + 1, a) returns ( \left( a + \frac{-ί \sqrt{3} + 1}{2} \right) \left( a + \frac{ί    
  \sqrt{3} + 1}{2} \right))    
  See also IFactor command.

### CSolutions

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/CSolutions/>

**语法：**

```
CSolutions( <Equation> )
CSolutions( <Equation>, <Variable> )
CSolutions( <List of Equations>, <List of Variables> )
```

**说明 / 示例：**

CAS Syntax  
Solves a given equation for the main variable and returns a list of all solutions, allowing for complex solutions.  
CSolutions(x^2 = -1) yields {ί, -ί}, the complex solutions of x2 = -1.  
Solves an equation for a given unknown variable and returns a list of all solutions, allowing for complex solutions.  
CSolutions(a^2 = -1, a) yields {ί, -ί}, the complex solutions of a2 = -1.  
Solves a set of equations for a given set of unknown variables and returns a list of all solutions, allowing for  
complex solutions.  
CSolutions({y^2 = x - 1, x = 2 * y - 1}, {x, y}) yields (\begin{pmatrix}1 + 2 ί&1 + ί\1 - 2 ί&1 -  
ί\end{pmatrix}), the complex solutions of y2 = x - 1 and x = 2 * y - 1.  
The complex ί is obtained by pressing ALT + i.  
See also CSolve Command and Solutions Command.

### CSolve

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/CSolve/>

**语法：**

```
CSolve( <Equation> )
CSolve( <Equation>, <Variable> )
CSolve( <List of Equations>, <List of Variables> )
```

**说明 / 示例：**

CAS Syntax  
Solves a given equation for the main variable and returns a list of all solutions, allowing for complex solutions.  
CSolve(x^2 = -1) yields {x = ί, x = -ί}, the complex solutions of x2 = -1.  
Solves an equation for a given unknown variable and returns a list of all solutions, allowing for complex solutions.  
CSolve(a^2 = -1, a) yields {a = ί, a = -ί}, the complex solutions of a2 = -1.  
Solves a set of equations for a given set of unknown variables and returns a list of all solutions, allowing for  
complex solutions.  
CSolve({y^2 = x - 1, x = 2 * y - 1}, {x, y}) yields {{x = 1 - 2 ί, y = 1 - ί}, {x = 1 + 2 ί, y = 1 + ί}}, the  
complex solutions of y2 = x - 1 and x = 2 * y - 1.  
The complex ί is obtained by pressing ALT + i.  
See also CSolutions Command and Solve Command.

### Coefficients

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Coefficients/>

**语法：**

```
Coefficients( <Polynomial> )
Coefficients( <Conic> )
Coefficients( <Polynomial>, <Variable> )
```

**说明 / 示例：**

Yields the list of all coefficients (a_k,a\_{k-1},\ldots,a_1, a_0) of the polynomial  
(a_k x^k+a\_{k-1}x^{k-1}+\cdots+a_1 x+a_0).  
Coefficients(x^3 - 3 x^2 + 3 x) yields {1, -3, 3, 0}.  
For non-polynomial curves obtained using one the fitting commands e.g. f(x) = FitExp(l1), the command  
Coefficients(f) will return the list of the calculated parameters.  
Returns the list of the coefficients a, b, c, d, e, f of a conic in standard form: (a\cdot x^2 + b\cdot  
y^2 + c + d\cdot x\cdot y + e\cdot x + f\cdot y = 0)  
For a line in implicit form l: ax + by + c = 0 it is possible to obtain the coefficients using the syntax x(l),  
y(l), z(l).  
Given line l: 3x + 2y - 2 = 0:  
x(l) returns 3  
y(l) returns 2  
z(l) returns -2  
CAS Syntax  
Yields the list of all coefficients of the polynomial in the main variable.  
Coefficients(x^3 - 3 x^2 + 3 x) yields {1, -3, 3, 0}.  
Yields the list of all coefficients of the polynomial in the given variable.  
Coefficients(a^3 - 3 a^2 + 3 a, a) yields {1, -3, 3, 0}.  
Coefficients(a^3 - 3 a^2 + 3 a, x) yields {a³ - 3 a² + 3 a}.

### CommonDenominator

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/CommonDenominator/>

**语法：**

```
CommonDenominator( <Expression>, <Expression> )
```

**说明 / 示例：**

Returns the function having as equation the lowest common denominator of the two expressions.  
CommonDenominator(3 / (2 x + 1), 3 / (4 x^2 + 4 x + 1)) yields f(x) = 4 x2 + 4 x + 1.  
CAS Syntax  
Returns the lowest common denominator of the two expressions.  
CommonDenominator(3 / (2 x + 1), 3 / (4 x^2 + 4 x + 1)) yields 4 x2 + 4 x + 1.

### CompleteSquare

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/CompleteSquare/>

**语法：**

```
CompleteSquare( <Quadratic Function> )
```

**说明 / 示例：**

Returns the quadratic function in the form: (a (x - h)^2 + k).  
CompleteSquare(x^2 - 4x + 7) yields 1 (x - 2)2 + 3.  
CAS Syntax  
Returns the quadratic function in the form: (a(x-h)^2+k).  
CompleteSquare(x^2 - 4x + 7) yields (x - 2)2 + 3.

### ComplexRoot

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/ComplexRoot/>

**语法：**

```
ComplexRoot( <Polynomial> )
```

**说明 / 示例：**

Finds the complex roots of a given polynomial in x. Points are created in Graphics View.  
ComplexRoot(x^2 + 4) yields (0 + 2 ί) and (0 - 2 ί)  
CAS Syntax  
Finds the complex roots of a given polynomial in x.  
ComplexRoot(x^2 + 4) yields {- 2 ί, 2 ί}  
Use CSolve Command instead.

### ContinuedFraction

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/ContinuedFraction/>

**语法：**

```
ContinuedFraction( <Number> )
ContinuedFraction( <Number>, <Level> )
ContinuedFraction( <Number>, <Level> (optional), <Boolean Shorthand> )
```

**说明 / 示例：**

Creates the continued fraction approximating a given number. The result is a LaTeX  
text object. The fraction is computed numerically within precision 10-8.  
ContinuedFraction(5.45) gives (5 + \frac{1}{ 2+ \frac{1}{4+ \frac{1}{ 1+ \frac{1}{ 1 } } } })  
Creates the continued fraction approximating the given number. The number of quotients is less than or equal to Level, but never exceeding the number of quotients needed to achieve the numerical precision of 10-8.  
ContinuedFraction(5.45, 3) gives (5 + \frac{1}{ 2+ \frac{1}{4+ ... } })  
Creates the continued fraction approximating the given number. If the parameter Level is specified, the number of quotients is less than or equal to Level, but never exceeding the number of quotients needed to achieve the numerical precision of 10-8. When Shorthand is true, the LaTeX text uses a shorter syntax, and contains a list of the integer parts of the continued fraction.  
ContinuedFraction(5.45, true) gives [5; 2, 4, 1, 1]  
ContinuedFraction(5.45, 3, true) gives [5; 2, 4, …]

### Degree

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Degree/>

**语法：**

```
Degree( <Polynomial> )
Degree( <Polynomial>, <Variable> )
```

**说明 / 示例：**

Gives the degree of a polynomial (in the main variable).  
Degree(x^4 + 2 x^2) yields 4  
CAS Syntax  
Gives the degree of a polynomial (in the main variable or  
monomial).  
Degree(x^4 + 2 x^2) yields 4  
Degree(x^6 y^3 + 2 x^2 y^3) yields 9  
Gives the degree of a polynomial in the given variable.  
Degree(x^4 y^3 + 2 x^2 y^3, x) yields 4  
Degree(x^4 y^3 + 2 x^2 y^3, y) yields 3

### Denominator

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Denominator/>

**语法：**

```
Denominator( <Function> )
Denominator( <Number> )
Denominator( <Expression> )
```

**说明 / 示例：**

Returns the denominator of a function.  
Denominator(5 / (x^2 + 2)) yields f(x)=(x2 + 2).  
For a rational number returns its (simplified) denominator. It uses a numerical method, which limits this command to numbers with  
small denominator. For irrational input the denominator of its continued  
fraction is returned.  
Denominator(5 / 3) yields 3.  
Denominator(10 / 6) yields 3.  
Denominator(15 / 3) yields 1.  
See also Numerator Command and FractionText Command.  
CAS Syntax  
Returns the denominator of a rational number or expression.  
Denominator(2 / 3 + 1 / 15) yields 15.

### Div

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Div/>

**语法：**

```
Div( <Dividend Number>, <Divisor Number> )
Div( <Dividend Polynomial>, <Divisor Polynomial> )
```

**说明 / 示例：**

Returns the quotient (integer part of the result) of the two numbers.  
Div(16, 3) yields 5.  
Returns the quotient of the two polynomials.  
Div(x^2 + 3 x + 1, x - 1) yields f(x) = x + 4.

### Division

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Division/>

**语法：**

```
Division( <Dividend Number>, <Divisor Number> )
Division( <Dividend Polynomial>, <Divisor Polynomial> )
```

**说明 / 示例：**

Gives the quotient (integer part of the result) and the remainder of the division of the two numbers.  
Division(16, 3) yields {5, 1}.  
Gives the quotient and the remainder of the division of the two polynomials.  
Division(x^2 + 3 x + 1, x - 1) yields {x + 4, 5}.  
In the Algebra View only one variable can be used and it will always be renamed to x. In the CAS View  
multivariable division is also supported.  
Division(x^2+y^2, x+y) yields {x - y, 2y^2}.  
Division(x^2+y^2, y+x) yields {y - x, 2x^2}.

### Divisors

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Divisors/>

**语法：**

```
Divisors( <Number> )
```

**说明 / 示例：**

Calculates the number of all the positive divisors, including the number itself.  
Divisors(15) yields 4, the number of all positive divisors of 15, including 15.  
CAS Syntax  
Calculates the number of all the positive divisors, including the number itself.  
Divisors(15) yields 4, the number of all positive divisors of 15, including 15.  
See also DivisorsList Command and DivisorsSum  
Command.

### DivisorsList

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/DivisorsList/>

**语法：**

```
DivisorsList( <Number> )
```

**说明 / 示例：**

Gives the list of all the positive divisors, including the number itself.  
DivisorsList(15) yields {1, 3, 5, 15}, the list of all positive divisors of 15, including 15.  
CAS Syntax  
Gives the list of all the positive divisors, including the number itself.  
DivisorsList(15) yields {1, 3, 5, 15}, the list of all positive divisors of 15, including 15.  
See also Divisors Command and DivisorsSum Command.

### DivisorsSum

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/DivisorsSum/>

**语法：**

```
DivisorsSum( <Number> )
```

**说明 / 示例：**

Calculates the sum of all the positive divisors, including the number itself.  
DivisorsSum(15) yields 24, the sum 1 + 3 + 5 + 15.  
CAS Syntax  
Calculates the sum of all the positive divisors, including the number itself.  
DivisorsSum(15) yields 24, the sum 1 + 3 + 5 + 15.  
See also Divisors Command and DivisorsList Command.

### Eliminate

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Eliminate/>

**语法：**

```
Eliminate( <List of Polynomials>, <List of Variables> )
```

**说明 / 示例：**

CAS Syntax  
Considers the algebraic equation system defined by the polynomials, and computes an equivalent system after  
eliminating all variables in the given list.  
Eliminate({x^2 + x, y^2 - x}, {x}) yields {( y^{4} + y^{2} )}.  
See also GroebnerLexDeg command.

### Expand

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Expand/>

**语法：**

```
Expand( <Expression> )
```

**说明 / 示例：**

Expands the expression.  
Expand((2 x - 1)^2 + 2 x + 3) yields (4 x^2 - 2 x + 4).  
This command needs to load the Computer Algebra System, so can be slow on some computers. Try using the  
Polynomial Command instead.  
CAS Syntax  
Expands the expression.  
Expand((2 x - 1)^2 + 2 x + 3) yields (4 x^2 - 2 x + 4).

### ExtendedGCD

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/ExtendedGCD/>

**语法：**

```
ExtendedGCD( <Integer>,<Integer> )
ExtendedGCD( <Polynomial>, <Polynomial> )
```

**说明 / 示例：**

CAS Syntax  
Returns a list containing the integer coefficients (s, t) of Bézout’s identity (as+bt= GCD(a,b)) and the  
greatest common divisor of the given integers (a) and (b).  
Results are calculated by applying the Extended Euclidean  
algorithm.  
ExtendedGCD(240,46) yields {(-9,47,2)}. (Plugging the result into the Bézout’s identity we have: (-9  
\cdot 240+47 \cdot 46=2)).  
Returns a list containing the polynomial coefficients (S(x), T(x)) of Bézout’s identity for polynomials  
(A(x)S(x) + B(x)T(x) = GCD(A(x), B(x))) and the greatest common divisor of the given polynomials (A(x)) and  
(B(x)).  
Results are calculated by applying the Extended Euclidean  
algorithm.  
ExtendedGCD(x^2-1,x+4) yields {(1,-x+4,15)}. (Plugging the result into the Bézout’s identity for polynomials  
we have: (1 \cdot (x^2-1) + (-x+4) \cdot (x+4) = 15)).  
The GCD of two polynomials is not unique (it’s unique up to a scalar multiple).  
See also GCD Command.

### Factor

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Factor/>

**语法：**

```
Factor( <Polynomial> )
Factor( <Number> )
Factor( <Expression>, <Variable> )
```

**说明 / 示例：**

This command differs among variants of English:  
Factor (US)  
Factorise (UK + Aus)  
Factors the polynomial.  
Factor(x^2 + x - 6) yields (x - 2) (x + 3).  
This command needs to load the Computer Algebra System, so can be slow on some computers.  
CAS Syntax  
In the CAS View you can also  
use the following syntax:  
Expresses a number in its prime factorization  
Factor(360) yields 2³ 3² 5.  
Factors an expression with respect to a given variable.  
Factor(x^2 - y^2, x) yields (x - y) (x + y), the factorization of x2 - y2 with respect to x,  
Factor(x^2 - y^2, y) yields -(y - x) (y + x), the factorization of x2 - y2 with respect to y.  
This command factors expressions over the Rational Numbers. To factor over  
irrational real numbers, see the IFactor Command. To factor over complex numbers, see the  
CFactor Command and CIFactor Command.

### Factors

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Factors/>

**语法：**

```
Factors( <Polynomial> )
Factors( <Number> )
```

**说明 / 示例：**

Gives a list of lists of the type {factor, exponent} such that the product of all these factors raised to the power  
of the corresponding exponents equals the given polynomial. The factors are sorted by degree in ascending order.  
Factors(x^8 - 1) yields {{x - 1, 1}, {x + 1, 1}, {x^2 + 1, 1}, {x^4 + 1, 1}}.  
Not all of the factors are irreducible over the reals.  
Gives matrix of the type (\left( \begin{array}{ll} prime_1 & exponent_1 \ prime_2 & exponent_2 \prime_3 &  
exponent_3 \ \end{array} \right) ) such that the product of all these primes raised to the power of the  
corresponding exponents equals the given number. The primes are sorted in ascending order.  
Factors(1024) yields ( 2 10 ), since (1024 = 2^{10}).  
Factors(42) yields (\left( \begin{array}{ll} 2 & 1 \ 3 & 1 \7 & 1 \ \end{array} \right) ), since  
(42 = 2^1・3^1・7^1).  
See also PrimeFactors Command and Factor Command.  
In the CAS View undefined  
variables can be used as input and the results are returned as proper matrices.  
Factors(a^8 - 1) yields (\left( \begin{array}{cc} a - 1 & 1 \ a +1 & 1 \a^2 + 1& 1 \a^4 + 1& 1 \  
\end{array} \right)).

### FromBase

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/FromBase/>

**语法：**

```
FromBase( "<Number as Text>", <Base> )
```

**说明 / 示例：**

Converts given number from given base into decimal base. The base must be between  
2 and 36. The number must be an integer.  
FromBase("FF", 16) returns 255.  
FromBase("100000000", 2) returns 256.  
See also ToBase command

### GCD

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/GCD/>

**语法：**

```
GCD( <Number>, <Number> )
GCD( <List of Numbers> )
GCD( <Polynomial>, <Polynomial> )
GCD( <List of Polynomials> )
```

**说明 / 示例：**

This command differs among variants of English:  
GCD (US)  
HCF (UK + Aus)  
Calculates the greatest common divisor of the two numbers .  
GCD(12, 15) yields 3.  
Calculates the greatest common divisor of the list of numbers.  
GCD({12, 30, 18}) yields 6.  
CAS Syntax  
In the CAS View you can also use the following syntax:  
Calculates the greatest common divisor of the two polynomials.  
GCD(x^2 + 4 x + 4, x^2 - x - 6) yields x + 2.  
Calculates the greatest common divisor of the list of polynomials.  
GCD({x^2 + 4 x + 4, x^2 - x - 6, x^3 - 4 x^2 - 3 x + 18}) yields x + 2.  
See also LCM Command and ExtendedGCD Command.

### GeometricMean

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/GeometricMean/>

**语法：**

```
GeometricMean(List of Numbers)
```

**说明 / 示例：**

Returns the geometric mean of given list of numbers.  
GeometricMean({13, 7, 26, 5, 19}) yields 11.76.

### HarmonicMean

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/HarmonicMean/>

**语法：**

```
HarmonicMean( <List of Numbers> )
```

**说明 / 示例：**

Returns the harmonic mean of given list of numbers.  
HarmonicMean({13, 7, 26, 5, 19}) yields 9.79.

### IFactor

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/IFactor/>

**语法：**

```
IFactor( <Polynomial> )
IFactor( <Expression> )
IFactor( <Expression>, <Variable> )
```

**说明 / 示例：**

Factors over the irrationals.  
IFactor(x^2 + x - 1) gives ( \left( x + \frac{-\sqrt{5} + 1}{2} \right) \left( x + \frac{\sqrt{5} +  
1}{2} \right))  
CAS Syntax  
Factors over the irrationals.  
IFactor(x^2 + x - 1) returns ( \left( x + \frac{-\sqrt{5} + 1}{2} \right) \left( x + \frac{\sqrt{5} +  
1}{2} \right))  
Factors over the irrationals with respect to a given variable.  
IFactor(a^2 + a - 1, a) returns ( \left( a + \frac{-\sqrt{5} + 1}{2} \right) \left( a + \frac{\sqrt{5} +  
1}{2} \right))  
See also CIFactor command.

### IsFactored

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/IsFactored/>

**语法：**

```
IsFactored( <Polynomial> )
```

**说明 / 示例：**

This command differs among variants of English:  
IsFactored (US)  
IsFactorised (UK + Aus)  
Returns ''true'' if the polynomial is factored in (\mathbb Q) and ''false'' otherwise. In general, in order to consider a polynomial decomposition as factored, the coefficient of the leading term of each factor needs to be positive.  
IsFactored(x) yields true  
IsFactored(0.5) yields true  
IsFactored(5) yields true  
IsFactored(x^2-1) yields false  
IsFactored(x^2-2) yields true  
IsFactored(x(x+1)) yields true  
IsFactored(x(2x+2)) yields false  
IsFactored(x^3-1) yields false  
IsFactored(x(x/2+1/2)) yields false  
IsFactored((x+1)(x^2-1)) yields false  
IsFactored(-2x-2) yields false  
IsFactored(2x+2) yields false

### IsInteger

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/IsInteger/>

**语法：**

```
IsInteger( <Number> )
```

**说明 / 示例：**

Returns true or false depending whether the number is an integer or not.  
IsInteger(972 / 9) returns true.

### IsPrime

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/IsPrime/>

**语法：**

```
IsPrime( <Number> )
```

**说明 / 示例：**

Gives true or false depending on whether the number is prime or not.  
IsPrime(10) yields false,  
IsPrime(11) yields true.  
CAS Syntax  
Gives true or false depending on whether the number is prime or not.  
IsPrime(10) yields false,  
IsPrime(11) yields true.

### LCM

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/LCM/>

**语法：**

```
LCM( <Number>, <Number> )
LCM( <List of Numbers> )
LCM( <Polynomial>, <Polynomial> )
LCM( <List of Polynomials> )
```

**说明 / 示例：**

UK English: LCM = lowest common multiple  
Calculates the least common multiple of two numbers.  
LCM(12, 15) yields 60.  
Calculates the least common multiple of the elements in the list.  
LCM({12, 30, 18}) yields 180.  
CAS Syntax  
In the CAS View you can also use the following syntax:  
Calculates the least common multiple of the two polynomials.  
LCM(x^2 + 4 x + 4, x^2 - x - 6) yields (x^3 + x^2 - 8 x - 12).  
Calculates the least common multiple of the polynomials in the list.  
LCM({x^2 + 4 x + 4, x^2 - x - 6, x^3 - 4 x^2 - 3 x + 18}) yields (x^4 - 2 x^3 - 11 x^2 + 12 x + 36).  
See also GCD Command.

### LeftSide

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/LeftSide/>

**语法：**

```
LeftSide( <Equation> )
LeftSide( <List of Equations> )
LeftSide( <List of Equations>, <Index> )
```

**说明 / 示例：**

Gives the left-hand side of the simplified equation.  
LeftSide(4x = 1 - 3y) yields 4x.  
CAS Syntax  
Gives the left-hand side of the equation.  
LeftSide(x + 2 = 3 x + 1) yields x + 2.  
Gives the list of the left-hand sides of the equations.  
LeftSide({a^2 + b^2 = c^2, x + 2 = 3 x + 1}) yields ( \left{a^2 + b^2, x + 2 \right} ) .  
Gives the left-hand side of the equation specified by the index.  
LeftSide({a^2 + b^2 = c^2, x + 2 = 3 x + 1}, 1) yields (a^2 + b^2).  
See also RightSide Command.

### Max

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Max/>

**语法：**

```
Max( <List> )
Max( <Interval> )
Max( <Number>, <Number> )
Max( <Function>, <Start x-Value>, <End x-Value> )
Max(<List of Data>, <List of Frequencies> )
```

**说明 / 示例：**

Returns the maximum of the numbers within the list.  
Max({-2, 12, -23, 17, 15}) yields 17.  
If the input consists of non-numeric objects, then this command considers the numbers associated with those objects. If  
you have a list of segments for example, the command Max( <List> ) will yield the maximum segment length.  
Returns the upper bound of the interval.  
Max(2 < x < 3) yields 3.  
Open and closed intervals are treated the same.  
Returns the maximum of the two given numbers.  
Max(12, 15) yields 15.  
Calculates (numerically) the local maximum point of the function in the given interval. The function should be  
continuous, defined over its natural domain (i.e. no domain restrictions are applied), and have only one local maximum point in the interval (and no local minimum).  
Max(exp(x)x^2,-3,-1) creates the point (-2, 0.54134).  
For polynomials you should use the Extremum Command.  
Returns the maximum of the list of data with corresponding frequencies.  
Max({1, 2, 3, 4, 5}, {5, 3, 4, 2, 0}) yields 4, the highest number of the list whose frequency is greater than 0.  
If you want the maximum of two functions f(x) and g(x) then you can define  
(f(x) + g(x) + abs(f(x) - g(x)))/2  
See also Extremum Command, Min Command and  
Function Inspector Tool.  
CAS Syntax  
Unlike in the Algebra View, this syntax will give the maximum over the interval, including endpoints. The function should be  
continuous, defined over its natural domain (i.e. no domain restrictions are applied), and have only one local maximum point in the interval (and no local minimum).  
Max(x^2,-1,2) yields the point (2,4)  
Max(-x^2,-1,2) yields the point (0,0)

### Mean

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Mean/>

**语法：**

```
Mean( <List of Raw Data> )
Mean( <List of Numbers>, <List of Frequencies> )
```

**说明 / 示例：**

Calculates the arithmetic mean of list elements.  
Mean({1, 2, 3, 2, 4, 1, 3, 2}) yields a = 2.25 and  
Mean({1, 3, 5, 9, 13}) yields a = 6.2.  
Calculates the weighted mean of the list elements.  
Mean({1, 2, 3, 4}, {6, 1, 3, 6}) yields a = 2.56 and  
Mean({1, 2, 3, 4}, {1, 1, 3, 6}) yields a = 3.27.  
See also MeanX, MeanY, and SD commands.

### Midpoint

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Midpoint/>

**语法：**

```
Midpoint( <Segment> )
Midpoint( <Conic> )
Midpoint( <Interval> )
Midpoint( <Point>, <Point> )
Midpoint( <Quadric> )
```

**说明 / 示例：**

Returns the midpoint of the segment.  
Let s = Segment((1, 1), (1, 5)). Midpoint(s) yields (1, 3).  
Returns the center of the conic.  
Midpoint(x^2 + y^2 = 4) yields (0, 0).  
Returns the midpoint of the interval (as number).  
Midpoint(2 < x < 4) yields 3.  
Returns the midpoint of two points.  
Midpoint((1, 1), (5, 1)) yields (3, 1).  
Returns the midpoint of the given quadric (e.g. sphere, cone, etc.)  
Midpoint(x^2 + y^2 + z^2 = 1) yields (0, 0, 0).  
See also  
Midpoint or Center tool.

### Min

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Min/>

**语法：**

```
Min( <List> )
Min( <Interval> )
Min( <Number>, <Number> )
Min( <Function>, <Start x-Value>, <End x-Value> )
Min( <List of Data>, <List of Frequencies> )
```

**说明 / 示例：**

Returns the minimum of the numbers within the list.  
Min({-2, 12, -23, 17, 15}) yields -23.  
If the input consists of non-numeric objects, then this command considers the numbers associated with those objects. If  
you have a list of segments for example, the command Min( <List> ) will yield the minimum segment length.  
Returns the lower bound of the interval.  
Min(2 < x < 3) yields 2 .  
Open and closed intervals are not distinguished.  
Returns the minimum of the two given numbers.  
Min(12, 15) yields 12.  
Calculates (numerically) the local minimum point for function in the given interval. The function should be  
continuous, defined over its natural domain (i.e. no domain restrictions are applied), and have only one local minimum point in the interval (and no local maximum).  
Min(exp(x) x^3,-4,-2) creates the point (-3, -1.34425) .  
For polynomials you should use the Extremum Command.  
Returns the minimum of the list of data with corresponding frequencies.  
Min({1, 2, 3, 4, 5}, {0, 3, 4, 2, 3}) yields 2, the lowest number of the first list whose frequency is greater  
than 0.  
If you want the minimum of two functions f(x) and g(x) then you can define  
(f(x) + g(x) - abs(f(x) - g(x)))/2  
See also Max Command, Extremum Command and  
Function Inspector Tool.  
CAS Syntax  
Unlike in the Algebra View, this syntax will give the minimum over the interval, including endpoints. The function should be  
continuous, defined over its natural domain (i.e. no domain restrictions are applied), and have only one local minimum point in the interval (and no local maximum).  
Min(x^2,-1,2) yields the point (0,0)  
Min(-x^2,-1,2) yields the point (2,-4)

### MixedNumber

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/MixedNumber/>

**语法：**

```
MixedNumber( <Number> )
```

**说明 / 示例：**

CAS Syntax  
Converts the given number to a mixed number.  
MixedNumber(3.5) yields (3 + \frac{1}{2}).  
MixedNumber(12 / 3) yields 4.  
MixedNumber(12 / 14) yields (\frac{6}{7}).  
See also Rationalize Command.

### Mod

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Mod/>

**语法：**

```
Mod( <Dividend Number>, <Divisor Number> )
Mod( <Dividend Polynomial>, <Divisor Polynomial> )
```

**说明 / 示例：**

Yields the remainder when dividend number is divided by divisor number.  
Mod(9, 4) yields 1.  
Yields the remainder when the dividend polynomial is divided by the divisor polynomial.  
Mod(x^3 + x^2 + x + 6, x^2 - 3) yields 4 x + 9.  
If you want a function to do this, you can define it yourself, e.g. mod(x, y) = y (x / y - floor(x / y)).

### ModularExponent

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/ModularExponent/>

**语法：**

```
ModularExponent( <Number>, <Number>, <Number> )
```

**说明 / 示例：**

CAS Syntax  
Returns the modular exponent of the given numbers.  
See also Modular exponentiation for further details.  
ModularExponent(5,12,13) yields (1), since (mod(5^{12},13)=1).

### NSolutions

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/NSolutions/>

**语法：**

```
NSolutions( <Equation> )
NSolutions( <Equation>, <Variable> )
NSolutions( <Equation>, <Variable = starting value> )
NSolutions( <List of Equations>, <List of Variables> )
```

**说明 / 示例：**

Attempts (numerically) to find a solution for the equation for the main variable. For non-polynomials you should  
always specify a starting value (see below)  
NSolutions(x^6 - 2x + 1 = 0) yields {0.51, 1} or {0.508660391642, 1} (the number of decimals depends on the  
chosen in global rounding)  
CAS Syntax  
The following syntaxes are only available in the  
CAS View.  
Attempts (numerically) to find a solution of the equation for the given unknown variable. For non-polynomials you  
should always specify a starting value (see below)  
NSolutions(a^4 + 34a^3 = 34, a) yields {a = -34.00086498588374, a = 0.9904738885574178}.  
Finds numerically the list of solutions to the given equation for the given unknown variable with its starting value.  
NSolutions(cos(x) = x, x = 0) yields {0.74}  
NSolutions(a^4 + 34a^3 = 34, a = 3) yields the list {0.99}.  
Attempts (numerically) to find a solution of the set of equations for the given set of unknown variables.  
NSolutions({pi / x = cos(x - 2y), 2 y - pi = sin(x)}, {x = 3, y = 1.5}) yields the list {3.14, 1.57}  
If you don’t give a starting point like a=3 or {x = 3, y = 1.5} the numerical algorithm may find it hard to find  
a solution (and giving a starting point doesn’t guarantee that a solution will be found)  
The number of decimals depends on the chosen in global rounding.  
NSolutions won’t work for functions that are asymptotic to the x-axis. They can often be reformulated though.  
NSolutions will work only if the function is continuous  
See also Solutions Command and NSolve Command.

### NSolve

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/NSolve/>

**语法：**

```
NSolve( <Equation> )
NSolve( <Equation>, <Variable> )
NSolve( <Equation>, <Variable = starting value> )
NSolve( <List of Equations>, <List of Variables> )
```

**说明 / 示例：**

Attempts (numerically) to find a solution for the equation for the main variable. For non-polynomials you should  
always specify a starting value (see below).  
NSolve(x^6 - 2x + 1 = 0) yields {x = 0.51, x = 1}.  
CAS Syntax  
These syntaxes are only available in the  
CAS View.  
Attempts (numerically) to find a solution of the equation for the given unknown variable. For non-polynomials you  
should always specify a starting value (see below).  
NSolve(a^4 + 34a^3 = 34, a) yields {a = -34, a = 0.99}.  
Finds numerically the list of solutions to the given equation for the given unknown variable with its starting value.  
NSolve(cos(x) = x, x = 0) yields {x = 0.74}  
NSolve(a^4 + 34a^3 = 34, a = 3) yields {a = 0.99}.  
Attempts (numerically) to find a solution of the set of equations for the given set of unknown variables.  
NSolve({pi / x = cos(x - 2y), 2 y - pi = sin(x)}, {x = 3, y = 1.5}) yields {x = 3.14, y = 1.57}.  
If you don’t give a starting point like a=3 or {x = 3, y = 1.5} the numerical algorithm may find it hard to find  
a solution (and giving a starting point doesn’t guarantee that a solution will be found)  
The number of decimals depends on the chosen in global rounding.  
NSolve won’t work for functions that are asymptotic to the x-axis or other extreme examples. They can often be  
reformulated though.  
NSolve will work only if the function is continuous!  
See also Solve Command and NSolutions Command.

### NextPrime

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/NextPrime/>

**语法：**

```
NextPrime( <Number> )
```

**说明 / 示例：**

Returns the smallest prime greater than the entered number.  
NextPrime(10000) yields 10007.  
See also PreviousPrime Command.

### Normalize

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Normalize/>

**语法：**

```
Normalize( <List of Numbers> )
Normalize( <List of Points> )
```

**说明 / 示例：**

This command differs among variants of English:  
Normalize (US)  
Normalise (UK + Aus)  
Returns a list containing the normalized form of the given numbers.  
Normalize({1, 2, 3, 4, 5}) returns {0, 0.25, 0.5, 0.75, 1}.  
Returns a list containing the normalized form of the given points.  
Normalize({(1,5), (2,4), (3,3), (4,2), (5,1)}) returns {(0,1), (0.25,0.75), (0.5,0.5), (0.75,0.25), (1,0)}.  
If you are doing calculations using big or small numbers (eg using FitGrowth) then  
normalizing them might avoid rounding/overflow errors  
This command is not applicable to 3D points.  
The operation of normalization maps a value x to the interval [0, 1] using the linear function (x \rightarrow \frac{x-Min(list)}{Max(list)-Min(list)}).

### Numerator

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Numerator/>

**语法：**

```
Numerator( <Function> )
Numerator( <Number> )
Numerator( <Expression> )
```

**说明 / 示例：**

Returns the numerator of the function.  
Numerator((3x² + 1) / (2x - 1)) yields f(x) = 3x² + 1.  
For a rational number returns its (simplified) numerator. It uses a numerical method, which limits this command to numbers with  
small denominator. For irrational input the numerator of its continued fraction  
is returned.  
Numerator(5 / 3) yields 5.  
Numerator(10 / 6) yields 5.  
Numerator(15 / 3) yields 5.  
See also Denominator Command and FractionText  
Command.  
CAS Syntax  
Returns the numerator of a rational number or expression.  
Numerator(2/3 + 1/15) yields 11.  
If variables a, b and c haven’t been previously defined in GeoGebra, then Numerator(a/b) yields a and  
Numerator(Simplify(a + b/c)) yields a c + b

### Numeric

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Numeric/>

**语法：**

```
Numeric( <Expression> )
Numeric( <Expression>, <Significant Figures> )
```

**说明 / 示例：**

CAS Syntax  
Tries to determine a numerical approximation of the given expression. The number of decimals depends on the global  
rounding you choose in the Options Menu.  
Numeric(3 / 2) yields 1.5.  
Tries to determine a numerical approximation of the given expression, using the entered number of significant figures.  
Numeric(sin(1), 20) yields 0.84147098480789650665.  
If you don’t specify enough digits then you can get an apparently wrong answer due to  
floating point cancelation.  
Numeric(-500000000/785398163*sin(785398163/500000000)1258025227.19^2+500000000/7853981631258025227.19^2,10) will  
give 4096 but  
Numeric(-500000000/785398163*sin(785398163/500000000)*1258025227.19^2+500000000/785398163*1258025227.19^2,30) will  
give 0.318309886345536696694580314215.  
See also Numeric tool.

### ParseToNumber

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/ParseToNumber/>

**语法：**

```
ParseToNumber( <Number>, <Text> )
ParseToNumber( <Text> )
```

**说明 / 示例：**

Parses the text and stores the result to a number a, which must be defined and  
free before the command is used.  
Define a = 3 and text1 = "6". ParseToNumber(a, text1) returns a = 6.  
This is a scripting command which only sets the value of a number once. To  
convert a text text1 into a number which is updated dynamically, use FromBase(text1,10).  
Parses the text and stores the result to a number.  
ParseToNumber("1+2+5-pi") creates the number a = 4.86.  
See also ParseToFunction command.

### PartialFractions

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/PartialFractions/>

**语法：**

```
PartialFractions( <Function> )
PartialFractions( <Function>, <Variable> )
```

**说明 / 示例：**

Yields, if possible, the partial fraction of the given function for the  
main function variable. The graph of the function is plotted in the Graphics View.  
PartialFractions(x^2 / (x^2 - 2x + 1)) yields 1 + (\frac{1}{(x - 1)²}) + (\frac{2}{x-1}).  
Hint: In the CAS View you can also use the following syntax:  
Yields, if possible, the partial fraction of the given function for the given function variable.  
PartialFractions(a^2 / (a^2 - 2a + 1), a) yields 1 + (\frac{1}{(a - 1)²}) + (\frac{2}{(a-1)}).

### PlotSolve

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/PlotSolve/>

**语法：**

```
PlotSolve( <Equation in x> )
```

**说明 / 示例：**

Solves a given equation for the main variable and returns a list of all solutions and the graphical output in the  
Graphics View.  
PlotSolve(x^2 = 4x) yields {(0, 0), (4, 0)} and displays the points (0, 0) and (4, 0) in the Graphics View.

### Polynomial

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Polynomial/>

**语法：**

```
Polynomial( <Function> )
Polynomial( <List of Points> )
Polynomial( <Function>, <Variable> )
```

**说明 / 示例：**

Expands the expression of a polynomial function and simplifies the result.  
Polynomial((x - 3)^2) yields x2 - 6x + 9.  
Polynomial(y^2+(x+y)^2) yields x2 + 2xy + 2y2.  
Polynomial(2x³ - 1 x² + 0x + 4) yields 2x³ - x² + 4.  
Creates the interpolation polynomial of degree n-1 through the given n points.  
Polynomial({(1, 1), (2, 3), (3, 6)}) yields 0.5 x2 + 0.5 x.  
CAS Syntax  
Expands the function and writes it as a polynomial in x (grouping the coefficients).  
Polynomial((x - 3)^2 + (a + x)^2) yields 2 x2 + (2a - 6) x + a2 + 9.  
Expands the function and writes it as a polynomial in the variable (grouping the coefficients).  
Polynomial((x - 3)^2 + (a + x)^2, a) yields a2 + 2 x a + 2 x2 - 6 x + 9.

### PreviousPrime

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/PreviousPrime/>

**语法：**

```
PreviousPrime( <Number> )
```

**说明 / 示例：**

Returns the greatest prime smaller than the entered number.  
PreviousPrime(10000) yields 9973.  
See also NextPrime Command.

### PrimeFactors

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/PrimeFactors/>

**语法：**

```
PrimeFactors( <Number> )
```

**说明 / 示例：**

Returns the list of primes whose product is equal to the given number.  
PrimeFactors(1024) yields {2, 2, 2, 2, 2, 2, 2, 2, 2, 2}.  
PrimeFactors(42) yields {2, 3, 7}.  
CAS Syntax  
Returns the list of primes whose product is equal to the given number.  
PrimeFactors(1024) yields {2, 2, 2, 2, 2, 2, 2, 2, 2, 2}.  
PrimeFactors(42) yields {2, 3, 7}.  
See also Factor command.

### Product

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Product/>

**语法：**

```
Product( <List of Raw Data> )
Product( <List of Numbers>, <Number of Elements> )
Product( <List of Numbers>, <List of Frequencies> )
Product( <Expression>, <Variable>, <Start Value>, <End Value> )
Product( <List of Expressions> )
```

**说明 / 示例：**

Calculates the product of all numbers in the list.  
Product({2, 5, 8}) yields 80.  
Calculates the product of the first n elements in the list.  
Product({1, 2, 3, 4}, 3) yields 6.  
Calculates the product of all elements in the list of numbers raised to the value given in the list of frequencies  
for each one of them.  
Product({20, 40, 50, 60}, {4, 3, 2, 1}) yields 1536000000000000  
Product({sqrt(2), cbrt(3), sqrt(5), cbrt(-7)}, {4, 3, 2, 3}) yields -420  
The two lists must have the same length.  
Calculates the product of the expressions that are obtained by replacing the given variable with every integer from the given  
start to the given end values.  
Product(k, k, 1, 7) yields 5040  
Product(x + k, k, 2, 3) yields f(x)=(x + 2)(x + 3).  
CAS Syntax  
Calculates the product of all elements in the list.  
Product({1, 2, x}) yields 2x.  
Calculates the product of the expressions that are obtained by replacing the given variable with every integer from the given  
start to the given end values.  
Product(x + 1, x, 2, 3) yields 12.

### RandomBetween

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/RandomBetween/>

**语法：**

```
RandomBetween( <Minimum Integer> , <Maximum Integer> )
RandomBetween( <Minimum Integer> , <Maximum Integer> , <Boolean Fixed> )
RandomBetween( <Minimum Integer> , <Maximum Integer>, <Number of Samples> )
```

**说明 / 示例：**

Generates a random integer between minimum and maximum (inclusive).  
RandomBetween(0, 10) yields a number between 0 and 10 (inclusive)  
If Boolean Fixed = "true", it generates a random integer between minimum and maximum (inclusive), which is  
updated just once (when file is loaded and also on undo/redo).  
RandomBetween(0, 10, true) yields a number between 0 and 10 (inclusive)  
Press F9 to see the difference between those two syntaxes.  
Generates a list of random integers between minimum and maximum (inclusive). The number of random integers in the  
list is the number of samples.  
RandomBetween(0, 10, 5) yields {1,3,4,8,2}, or {7,5,6,1,7}, etc.  
See also SetSeed command, RandomElement command,  
RandomBinomial command, RandomNormal command,  
RandomPoisson command, RandomUniform command.

### RandomPolynomial

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/RandomPolynomial/>

**语法：**

```
RandomPolynomial( <Degree> , <Minimum for Coefficients>, <Maximum for Coefficients> )
RandomPolynomial( <Variable>, <Degree> , <Minimum for Coefficients>, <Maximum for Coefficients> )
```

**说明 / 示例：**

Returns a randomly generated polynomial in x of degree d, whose (integer) coefficients are in the range from  
minimum to maximum, both included.  
RandomPolynomial(0, 1, 2) yields either 1 or 2.  
RandomPolynomial(2, 1, 2) yields a random polynomial with a degree of two and only 1 and 2 as coefficients,  
for example 2x2 + x + 1.  
CAS Syntax  
The following command is only available in the  
CAS View.  
Returns a randomly generated polynomial in Variable of degree d, whose (integer) coefficients are in the range  
from minimum to maximum, both included.  
RandomPolynomial(a, 0, 1, 2) yields either 1 or 2.  
RandomPolynomial(a, 2, 1, 2) yields a random polynomial with a degree of two and only 1 and 2 as  
coefficients, for example 2a2 + a + 1.  
In both cases if minimum or maximum are not integers, round(minimum) and round(maximum) are used instead.

### Rationalize

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Rationalize/>

**语法：**

```
Rationalize( <Number> )
```

**说明 / 示例：**

This command differs among variants of English:  
Rationalize (US)  
Rationalise (UK + Aus)  
CAS Syntax  
Creates the fraction of the given Number, and rationalizes the denominator, if it contains square roots.  
Rationalize(3.5) yields (\frac{7}{2}).  
Rationalize(1/sqrt(2)) yields (\frac{\sqrt{2} }{2}).  
See also MixedNumber Command.

### RightSide

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/RightSide/>

**语法：**

```
RightSide( <Equation> )
RightSide( <List of Equations> )
RightSide( <List of Equations>, <Index> )
```

**说明 / 示例：**

Gives the right-hand side of the simplified equation.  
RightSide(x + 2 = 3x + 1) yields 0.5  
CAS Syntax  
Gives the right-hand side of the equation.  
RightSide(x + 3 = 3 x + 1) yields 3 x + 1.  
Gives the list of the right-hand sides of the equations.  
RightSide({a^2 + b^2 = c^2, x + 2 = 3x + 1}) yields {c2, 3x + 1}.  
Gives the right-hand sides of the equation specified by the index.  
RightSide({a^2 + b^2 = c^2, x + 2 = 3 x + 1}, 1) yields (c^2).  
See also LeftSide Command.

### Root

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Root/>

**语法：**

```
Root( <Polynomial> )
Root( <Function>, <Initial x-Value> )
Root( <Function>, <Start x-Value>, <End x-Value> )
```

**说明 / 示例：**

Yields all roots of the polynomial as intersection points of the function graph and the x‐axis.  
Root(0.1*x^2 - 1.5*x + 5) yields A = (5, 0) and B = (10, 0).  
Yields one root of the function using the initial value a for a numerical iterative method.  
Root(0.1*x^2 - 1.5*x + 5, 6) yields A = (5, 0).  
Let a be the Start x-Value and b the End x-Value . This command yields one root of the function in the  
interval [a, b] using a numerical iterative method.  
Root(0.1x² - 1.5x + 5, 8, 13) yields A = (10, 0).  
CAS Syntax  
Yields all roots of the polynomial as a list.  
Root(x^3 - 3 \* x^2 - 4 \* x + 12) yields {x = -2, x = 2, x = 3}.  
In the CAS View, this  
command is only a special variant of Solve Command.

### Simplify

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Simplify/>

**语法：**

```
Simplify( <Function> )
Simplify( <Text> )
```

**说明 / 示例：**

Simplifies the terms of the given function, if possible.  
Simplify(x + x + x) yields the function f(x) = 3x.  
Attempts to tidy up text expressions by removing repeated negatives etc.  
For a = b = c = -1 Simplify("f(x) = " + a + "x² + " + b + "x + " + c) yields the text f(x) = -x2 - x -  
1\.  
The FormulaText Command normally produces better results and is simpler.  
This command needs to load the Computer Algebra System, so can be slow on some computers. Try using the  
Polynomial Command instead.  
CAS Syntax  
Simplifies the terms of the given function, if possible. Undefined variables can be included in the terms.  
Simplify(3 \* x + 4 \* x + a \* x) yields a x + 7x.  
Assume(x<2,Simplify(sqrt(x-2sqrt(x-1)))) yields -sqrt(abs(x - 1)) + 1  
Assume(x>2,Simplify(sqrt(x-2sqrt(x-1)))) yields sqrt(x - 1) + 1  
See also Factor Command, Assume Command,  
PartialFractions Command, Expand Command,  
Polynomial Command.

### Solutions

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Solutions/>

**语法：**

```
Solutions( <Equation> )
Solutions( <Equation>, <Variable> )
Solutions( <List of Equations>, <List of Variables> )
```

**说明 / 示例：**

Starting from version 823 this command behaves as Solve command, except for the format of the  
result: command Solutions returns a list of values, while command Solve returns a list of equations in the form  
variable name = value.  
Solves a given equation for the main variable and returns a list of all solutions.  
Solutions(x^2 = 4x) yields {0, 4}.  
CAS Syntax  
Solves an equation for a given unknown variable and returns a list of all solutions.  
Solutions(x * a^2 = 4a, a) yields {(\frac{4}{x},0)}.  
Solves a set of equations for a given set of unknown variables and returns a list of all solutions.  
Solutions({x = 4 x + y , y + x = 2}, {x, y}) yields {{-1, 3}}, the sole solution of x = 4x + y and y + x  
= 2, displayed as (\begin{pmatrix}-1&3\end{pmatrix}).  
Solutions({2a^2 + 5a + 3 = b, a + b = 3}, {a, b}) yields {{-3, 6}, {0, 3}}, displayed as  
(\begin{pmatrix}-3&6\0&3\end{pmatrix}).  
Sometimes you need to do some manipulation to allow the automatic solver to work, for example  
Solutions(TrigExpand(sin(5/4 π + x) - cos(x - 3/4 π) = sqrt(6) * cos(x) - sqrt(2)))  
See also Solve Command.

### Solve

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Solve/>

**语法：**

```
Solve( <Equation in x> )
Solve( <Equation>, <Variable> )
Solve( <Equation in x>, <Assumption> )
Solve( <List of Equations>, <List of Variables> )
Solve( <Equation>, <Variable> , <List of assumptions>)
Solve( <List of Parametric Equations>, <List of Variables> )
```

**说明 / 示例：**

Commands Solve and Solutions solve an equation or a system of equations over the real  
numbers symbolically. To solve equations numerically, use the NSolve Command. For solving  
equations in complex numbers see CSolve Command.  
Solves a given equation for the main variable and returns a list of all solutions.  
Solve(x^2 = 4x) yields {x = 4, x = 0}, the solutions of x2 = 4x.  
CAS Syntax  
The following commands are only available in the  
CAS View.  
Solves an equation for a given unknown variable and returns a list of all solutions.  
Solve(x * a^2 = 4a, a) yields {(a = \frac{4}{x}, a = 0)}.  
Solves an equation x, conditional on the assumption  
Solve(x^2=1, x>0) yields ({x = 1})  
Solves a set of equations for a given set of unknown variables and returns a list of all solutions.  
Solve({x = 4 x + y , y + x = 2}, {x, y}) yields {{ x = -1, y = 3 }}  
Solve({2a^2 + 5a + 3 = b, a + b = 3}, {a, b}) yields {{a = 0, b = 3}, {a = -3, b = 6}}.  
Solves an equation for a given unknown variable with the list of assumptions and returns a list of all solutions.  
Solve(u *x < a,x, u>0) yields {x < a / u}, the solution of u *x < a assuming that u>0  
Solve(u x < a,x, {u<0, a<0}) yields {x > a / u}.  
Solves a set of parametric equations for a given set of unknown variables and returns a list of all solutions.  
Solve({(x, y) = (3, 2) + t(5, 1), (x, y) = (4, 1) + s*(1, -1)}, {x, y, t, s}) yields {{x = 3, y = 2, t = 0,  
s = -1}}.  
The right hand side of equations (in any of the above syntaxes) can be omitted. If the right hand side is missing, it  
is treated as 0.  
Sometimes you need to do some manipulation to allow the automatic solver to work, for example  
Solve(TrigExpand(sin(5/4 π + x) - cos(x - 3/4 π) = sqrt(6) * cos(x) - sqrt(2))).  
For piecewise-defined functions, you will need to use NSolve

### SolveCubic

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/SolveCubic/>

**语法：**

```
SolveCubic( <Cubic Polynomial> )
```

**说明 / 示例：**

CAS Syntax  
Solves a given cubic polynomial and returns a list of all solutions.  
SolveCubic(x³ - 1) yields { 1, ( \frac{1}{2} (\sqrt{3} i -1) ) , ( \frac{1}{2} (\sqrt{3} (-i) -1)  
) } .  
Often the answers are cumbersome, e.g. SolveCubic(x³ + x² + x + 2) in which case Solve(x³ + x² + x + 2)  
or CSolve(x³ + x² + x + 2) may work better for you.

### SolveQuartic

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/SolveQuartic/>

**语法：**

```
SolveQuartic( <Quartic Polynomial> )
```

**说明 / 示例：**

This page is about a feature that is supported only in GeoGebra beta.  
CAS Syntax  
Solves a given quartic polynomial and returns a list of all solutions.  
SolveQuartic( x^4 + x^3 + x^2 + x ) yields {0, -1, i, -i }

### Substitute

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Substitute/>

**语法：**

```
Substitute( <Expression>, <from>, <to> )
Substitute( <Expression>, <Substitution List> )
```

**说明 / 示例：**

CAS Syntax  
Replaces in expression all occurrences of from with to and evaluates the result when variables are substituted with values.  
Substitute((3 m - 3)^2 - (m + 3)^2, m, a) yields 8 a2 - 24 a.  
Substitute((3 m - 3)^2 - (m + 3)^2, m, 2) yields -16.  
Replaces in expression every occurrence of the variables in the substitution list with the corresponding terms or values, and evaluates numerical substitutions.  
Substitute(2x + 3y - z, {x = a, y = 2, z = b}) yields 2a - b + 6.  
Substitute(2x + 3y - z, x = a, y = 2, z = b) yields 2a - b + 6.

### Sum

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Sum/>

**语法：**

```
Sum( <List> )
Sum( <List>, <Number of Elements> )
Sum( <List>, <List of Frequencies> )
Sum( <Expression>, <Variable>, <Start Value>, <End Value> )
```

**说明 / 示例：**

Calculates the sum of all the elements in the list.  
Sum({1, 2, 3}) yields the number a = 6.  
Sum({x^2, x^3}) yields f(x) = x2 + x3.  
Sum(Sequence(i, i, 1, 100)) yields the number a = 5050.  
Sum({(1, 2), (2, 3)}) yields the point A = (3, 5).  
Sum({"a", "b", "c"}) yields the text "abc".  
Calculates the sum of the first n elements in the list.  
Sum({1, 2, 3, 4, 5, 6}, 4) yields the number a = 10.  
Returns the sum of the given list of values, considering the related frequencies.  
Sum({1, 2, 3, 4, 5}, {3, 2, 4, 4, 1}) yields a = 40.  
This command works for numbers, points, vectors, text, and functions.  
Lists must contain objects of the same type.  
CAS Syntax  
The following command works only in the  
CAS View.  
Computes the sum (\sum\_{t=Start Value}^{End Value}f(t)). End value can also be infinity.  
Sum(n^2, n, 1, 3) yields 14.  
Sum(r^k, k, 0, n) yields (\frac{r^{n+1} }{r - 1} - \frac{1}{r - 1}).  
Sum((1/3)^n, n, 0, Infinity) yields (\frac{3}{2}).

### ToBase

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/ToBase/>

**语法：**

```
ToBase( <Number>, <Base> )
```

**说明 / 示例：**

Converts given number into different base. The base must be between 2 and 36.  
The number must be an integer.  
ToBase(255,16) returns "FF".  
ToBase(256, 2) returns "100000000".  
See also FromBase command.

### Vertex

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Vertex/>

**语法：**

```
Vertex( <Conic> )
Vertex( <Inequality> )
Vertex( <Polygon> )
Vertex( <Polygon>, <Index n> )
Vertex( <Segment>, <Index> )
```

**说明 / 示例：**

Returns (all) vertices of the conic section.  
Returns the points of intersection of the borders.  
Vertex((x + y < 3) && (x - y > 1)) returns point A = (2, 1).  
{Vertex((x + y < 3) ∧ (x - y > 1) && (y > - 2))} returns list1 = {(2, 1), (5, -2), (-1, -2)}.  
Vertex((y > x²) ∧ (y < x)) returns two points A = (0, 0) and B = (1, 1).  
{Vertex((y > x²) ∧ (y < x))} returns list1 = {(0, 0), (1, 1)}.  
Returns (all) vertices of the polygon.  
Returns n-th vertex of the polygon.  
To get the vertices of the objects polygon / conic / inequality in a list, use {Vertex(Object)}.  
Returns the start-point (Index = 1) or end-point (Index = 2) of the Segment.

## 图表命令

> 共 15 个命令

### BarChart

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/BarChart/>

**语法：**

```
BarChart( <List of Data>, <List of Frequencies> )
BarChart( <List of Raw Data>, <Width of Bars>, <Vertical Scale Factor (optional)> )
BarChart( <List of Data> , <List of Frequencies>, <Width of Bars> )
BarChart( <Start Value>, <End Value>, <List of Heights> )
BarChart( <Start Value>, <End Value> , <Expression>, <Variable>, <From Number>, <To Number> )
BarChart( <Start Value>, <End Value>, <Expression>, <Variable>, <From Number>, <To Number>, <Step Width> )
```

**说明 / 示例：**

Creates a bar chart using the list of data with corresponding frequencies.  
BarChart({10, 11, 12, 13, 14}, {5, 8, 12, 0, 1})  
BarChart({5, 6, 7, 8, 9}, {1, 0, 12, 43, 3})  
BarChart({0.3, 0.4, 0.5, 0.6}, {12, 33, 13, 4})  
The numbers in the list of raw data need to be arranged in increasing order.  
Creates a bar chart using the given raw data; the bars have the given width and the height of the bars depends on the  
vertical scale factor.  
BarChart({1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 3, 5, 5, 5, 5}, 1)  
BarChart({1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 3, 5, 5, 5, 5}, 1, 2)  
Creates a bar chart using the list of data and corresponding frequencies. Bars' width is given.  
BarChart({10, 11, 12, 13, 14}, {5, 8, 12, 0, 1}, 0.5) leaves gaps between bars.  
BarChart({10, 11, 12, 13, 14}, {5, 8, 12, 0, 1}, 0) produces a line graph.  
Creates a bar chart over the given interval: the number of bars is determined by the length of the list, whose  
elements are the heights of the bars.  
BarChart(10, 20, {1, 2, 3, 4, 5}) gives a bar chart with five bars of specified height in the interval [10,  
20].  
Creates a bar chart over the interval [Start Value, End Value], that calculates the bars’ heights using the  
expression of the given Variable in the interval [From number, To number].  
If p = 0.1, q = 0.9, and n = 10 are numbers, then  
BarChart(-0.5, n + 0.5, BinomialCoefficient(n,k) \* p^k \* q^(n-k), k, 0, n) gives you a bar chart in the interval  
[-0.5, n+0.5]. The heights of the bars depend on the probabilities calculated using the given expression.  
Creates a bar chart over the interval [Start Value, End Value], that calculates the bars’ heights using the  
expression of the given Variable in the interval [From number, To number] with given Step width.  
It is possible to specify a different color/filling for each bar in the  
Object Properties.

### BoxPlot

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/BoxPlot/>

**语法：**

```
BoxPlot( yOffset, yScale, List of Raw Data )
BoxPlot( <yOffset>, <yScale>, <List of Raw Data>, <Boolean Outliers> )
BoxPlot( <yOffset>, <yScale>, <List of Data>, <List of Frequencies>, <Boolean Outliers> )
```

**说明 / 示例：**

Creates a box plot using the given raw data and whose vertical position in the coordinate system is controlled by  
variable yOffset and whose height is influenced by factor yScale.  
BoxPlot(0, 1, {2, 2, 3, 4, 5, 5, 6, 7, 7, 8, 8, 8, 9})  
BoxPlot( yOffset, yScale, Start Value, Q1, Median, Q3, End Value )  
Creates a box plot for the given statistical data in interval (Start Value, End Value).  
This allows outliers to be plotted as "X"s rather than included in the boxplot. For this command,  
outliers are data lying below Q1 - 1.5 \* (Q3 - Q1) or above Q3 + 1.5 \* (Q3 -  
Q1) (see IQR).  
This allows data from a frequency table to be easily plotted as a boxplot.

### ContingencyTable

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/ContingencyTable/>

**语法：**

```
ContingencyTable( <List of Text>, <List of Text> )
ContingencyTable( <List of Text>, <List of Text>, <Options> )
ContingencyTable( <List of Row Values>, <List of Column Values>, <Frequency Table> )
ContingencyTable( <List of Row Values>, <List of Column Values> <Frequency Table>, <Options> )
```

**说明 / 示例：**

Draws a Contingency Table created from the two given lists. Unique  
values from the first list are used as row values in the table. Unique values from the second list are used as column  
values in the table.  
Draws a Contingency Table created from the two given lists as  
described above. The text Options controls the display of optional calculations within the table.  
Possible values for Options are "|", "*", "+", "e", "k", "=".  
"|" = show column percentages  
"*" = show row percentages  
"+" = show total percentages  
"e" = show expected counts  
"k" = show Chi Squared contributions  
"=" = show results of a Chi Squared test  
Draws a Contingency Table using the given list of row values, column  
values and corresponding frequency table.  
ContingencyTable({"Males","Females"},{"Right-handed", "Left-handed"},{{43,9},{44,4}}) yields the corresponding  
Contingency Table.  
Draws a Contingency Table using the given list of row values, column  
values and corresponding frequency table. The text Options controls the display of optional calculations within the  
table as described above.  
ContingencyTable({"Males","Females"},{"Right-handed", "Left-handed"},{{43,9},{44,4}},"\_") yields the corresponding  
Contingency Table showing the row percentages.

### DotPlot

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/DotPlot/>

**语法：**

```
DotPlot( <List of Raw Data> )
DotPlot( <List of Raw Data>, <Stack Adjacent Dots (optional)>, <Scale Factor (optional)> )
```

**说明 / 示例：**

Returns a dot plot for the given list of numbers, as well as the list of the dot plot points. If a number n appears  
in the list of raw data k times, the returned list contains points (n, 1), (n, 2), …, (n, k).  
DotPlot({2, 5, 3, 4, 3, 5, 3}) yields {(2, 1), (3, 1), (3, 2), (3, 3), (4, 1), (5, 1), (5, 2)}.  
Returns a dot plot for the given list of data, as well as the list of the dot plot points. If a data n appears in  
the list of raw data k times, the returned list contains points (n, 1), (n, 2),…, (n, k).  
If you choose a Scale Factor s, the returned list contains points (n, 1s), (n, 2s), …, (n, ks).  
Stack Adjacent Dots means a Boolean Value (true or false): If you choose true, points (which are close to each  
other) are stacked. If you choose false, the result will be the same as without <Stack Adjacent Dots (optional)>.  
The command DotPlot will also work with a list of text.  
DotPlot({"Red", "Red", "Red", "Blue", "Blue"}) yields {(1, 1), (1, 2), (2, 1), (2, 2), (2, 3)}.  
If you use a list of text the DotPlot command will put the result in alphabetical order. (e.g. Blue appears two times,  
Red three times and B comes before R in the alphabet, so you get (1, 1), (1, 2) for Blue and (2, 1), (2, 2), (2,  
3\) for Red.)

### FrequencyPolygon

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/FrequencyPolygon/>

**语法：**

```
FrequencyPolygon( <List of Class Boundaries>, <List of Heights> )
FrequencyPolygon( <List of Class Boundaries>, <List of Raw Data>, <Boolean Use Density>, <Density Scale Factor (optional)> )
FrequencyPolygon( <Boolean Cumulative>, <List of Class Boundaries>, <List of Raw Data>, <Boolean Use Density> , <Density Scale Factor (optional)> )
```

**说明 / 示例：**

Frequency polygon is a line graph drawn by joining all the midpoints of the top of the bars of a histogram. Therefore  
usage of this command is the same as usage of Histogram Command.  
Creates a frequency polygon with vertices in given heights. The class boundaries determine the x-coordinate of each  
vertex.  
FrequencyPolygon({0, 1, 2, 3, 4, 5}, {2, 6, 8, 3, 1}) creates the corresponding line graph.  
Creates a frequency polygon using the raw data. The class boundaries determine the x-coordinates of vertices and are  
used to determine how many data elements lie in each class. The y-coordinate of a vertex is determined as follows  
If Use Density = true, height = (Density Scale Factor) * (class frequency) / (class width)  
If Use Density = false, height = class frequency  
By default, Use Density = true and Density Scale Factor = 1.  
If Cumulative is true this creates a frequency polygon where each vertex y-coordinate equals the frequency of the  
class plus the sum of all previous frequencies.  
For further examples see Histogram Command.

### FrequencyTable

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/FrequencyTable/>

**语法：**

```
FrequencyTable( <List of Raw Data> )
FrequencyTable( <Boolean Cumulative>, <List of Raw Data> )
FrequencyTable( <List of Class Boundaries>, <List of Raw Data> )
FrequencyTable( <Boolean Cumulative>, <List of Class Boundaries>, <List of Raw Data> )
FrequencyTable( <List of Class Boundaries>, <List of Raw Data>, <Use Density> , <Density Scale Factor (optional)> )
FrequencyTable( <Boolean Cumulative>, <List of Class Boundaries>, <List of Raw Data>, <Use Density> , <Density Scale Factor (optional)> )
FrequencyTable( <List of Raw Data>,<Scale Factor (optional)> )
```

**说明 / 示例：**

Returns a table (as text) whose first column contains sorted list of unique elements of list L and second column  
contains the count of the occurrences of value in the first column. List L can be numbers or text.  
If Cumulative = false, returns the same table as Frequency( <List of Raw Data> )  
If Cumulative = true, returns a table whose first column is the same as in FrequencyTable( <List of Raw Data> ) and  
the second contains cumulative frequencies of values in the first column.  
Returns a table (as text) whose first column contains intervals (classes) and second column contains the count of  
numbers in List of Raw Data, which belong to the interval in the first column. All intervals except the highest  
interval are of the form [a, b). The highest interval has the form [a, b].  
If Cumulative = false, returns the same table as FrequencyTable( <List of Class Boundaries>, <List of Raw Data> )  
If Cumulative = true, returns a table whose first column is the same as in FrequencyTable( <List of Raw Data> ) and  
the second contains cumulative frequencies of values in the first column.  
Returns a table (as text) whose first column contains intervals (classes) and second contains frequencies for the  
corresponding Histogram Command.  
Returns a table (as text) whose first column contains intervals (classes) and second contains frequencies for the  
corresponding Histogram Command.  
Returns a table (as text) whose first column Value contains a sorted list of unique elements of the <List of Raw  
Data> and second column Frequency contains the count of the occurrences of value in the first column multiplied by  
the <Scale Factor>. The list can be numbers or text.  
FrequencyTable({"red", "red", "green", "green", "blue"}, 5) returns a table with first column Value with entries  
blue, green, red (alphabetical order) and second column Frequency with entries 5, 10, 10.  
FrequencyTable({1, 1, 1, 2, 2, 3, 3, 4, 5}, 2) returns a table with first column Value with entries 1, 2, 3, 4,  
5 and second column Frequency with entries 6, 4, 4, 2, 2.  
In the list there appears 1 three-times, so the count of the occurrences of 1 (=3) has to be multiplied by the scale  
factor 2 to get entry 6 in the second column.  
This command is similar to Frequency Command and Histogram  
Command. Articles about these commands contain some related examples.

### Histogram

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Histogram/>

**语法：**

```
Histogram( <List of Class Boundaries>, <List of Heights> )
Histogram( <List of Class Boundaries>, <List of Raw Data>, <Boolean Use Density>, <Density Scale Factor>(optional) )
Histogram( <Boolean Cumulative>, <List of Class Boundaries>, <List of Raw Data>, <Boolean Use Density> , <Density Scale Factor> (optional) )
```

**说明 / 示例：**

Creates a histogram with bars of the given heights. The class boundaries determine the width and position of each bar  
of the histogram.  
Histogram({0, 1, 2, 3, 4, 5}, {2, 6, 8, 3, 1}) creates a histogram with 5 bars of the given heights. The first bar  
is positioned at the interval [0, 1], the second bar is positioned at the interval [1, 2], and so on.  
Creates a histogram using the raw data. The class boundaries determine the width and position of each bar of the  
histogram and are used to determine how many data elements lie in each class. Bar height is determined as follows  
If Use Density = true, height = (Density Scale Factor) * (class frequency) / (class width)  
If Use Density = false, height = class frequency  
By default, Use Density = true and Density Scale Factor = 1. This creates a histogram with total area = n, the number of  
data values.  
All elements of Raw Data must be within the interval of the class boundaries, otherwise “undefined” will be returned.  
By convention this uses the a ≤ x < b rule for each class except for the last class which is a ≤ x ≤ b  
(Default Histogram)  
Histogram({10, 20, 30, 40}, {10, 11, 11, 12, 18, 20, 25, 40}, true) creates a histogram with 3 bars, with the  
heights 0.5 (first bar), 0.2 (second bar), and 0.1 (third bar).  
This histogram has total area = 0.5*10 + 0.2*10 + 0.1*10 = 8.  
(Count Histogram)  
Histogram({10, 20, 30, 40}, {10, 11, 11, 12, 18, 20, 25, 40}, false) creates a histogram with 3 bars, with the  
heights 5 (first bar), 2 (second bar), and 1 (third bar). This histogram does not use density scaling and gives bar  
heights that equal the count of values in each class.  
(Relative Frequency Histogram)  
Histogram({10, 20, 30, 40}, {10, 11, 11, 12, 18, 20, 25, 40}, true, 10/ 8) creates a histogram with 3 bars, with  
the heights 0.625 (first bar), 0.25 (second bar), and 0.125 (third bar). This histogram uses density scaling to give bar  
heights that equal the proportion of values in each class.  
If n is the number of data values, and the classes have constant width w, then Density Scale Factor = w/n creates a  
relative histogram.  
(Normalized Histogram)  
Histogram({10, 20, 30, 40}, {10, 11, 11, 12, 18, 20, 25, 40}, true, 1/8) creates a histogram with 3 bars, with the  
heights .0625 (first bar), .025 (second bar), and .0125 (third bar).  
This histogram has total area = .0625*10 + .025*10 + .0125*10 = 1.  
If n is the number of data values, then Density Scale Factor = 1/n creates a normalized histogram with total area = 1.  
This is useful for fitting a histogram with a density curve.  
If Cumulative is true this creates a histogram where each bar height equals the frequency of the class plus the sum of  
all previous frequencies.  
Histogram(true, {10, 20, 30, 40}, {10, 11, 11, 12, 18, 20, 25, 40}, true) creates a histogram with 3 bars, with  
the heights 0.5 (first bar), 0.7 (second bar), and 0.8 (third bar).

### HistogramRight

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/HistogramRight/>

**语法：**

```
HistogramRight( <List of Class Boundaries>, <List of Heights> )
HistogramRight( <List of Class Boundaries>, <List of Raw Data>, <Boolean Use Density> , <Density Scale Factor> (optional) )
HistogramRight( <Boolean Cumulative>, <List of Class Boundaries>, <List of Raw Data>, <Boolean Use Density> , <Density Scale Factor> (optional) )
```

**说明 / 示例：**

Same as Histogram(<List of Class Boundaries>, <List of Heights>) (see Histogram Command).  
Same as  
Histogram(<List of Class Boundaries>, <List of Raw Data>, <Boolean Use Density>, <Density Scale Factor>), except  
that if a datum is equal to the right border of a class, it is counted in this class and not in the next one.  
Same as  
Histogram(<Boolean Cumulative>, <List of Class Boundaries>, <List of Raw Data>, <Boolean Use Density>, <Density Scale Factor>),  
except that if a datum is equal to the right border of a class, it is counted in this class and not in the next one.  
By convention this uses the a < x ≤ b rule for each class except for the first class which is a ≤ x ≤ b

### LineGraph

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/LineGraph/>

**语法：**

```
LineGraph (<List of x-coordinates>, <List of y-coordinates>)
```

**说明 / 示例：**

Creates a chart, connecting with line segments the points whose coordinates are defined in the lists, to visualize  
given data.  
<List of x-coordinates> is a list containing the x values, defined as numbers in increasing order,  
<List of y-coordinates> is a list containing the y values, defined as numbers.

### NormalQuantilePlot

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/NormalQuantilePlot/>

**语法：**

```
NormalQuantilePlot( <List of Raw Data> )
```

**说明 / 示例：**

Creates a normal quantile plot from the given list of data and draws a line through the points showing the ideal plot  
for exactly normal data. Points are formed by plotting data values on the x-axis against their expected normal score  
(Z-score) on the y-axis. More precisely the y-values are computed using Filliben’s estimate.

### PieChart

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/PieChart/>

**语法：**

```
PieChart(< List of Frequencies >)
PieChart(< List of Frequencies >, < Center >, < Radius >)
```

**说明 / 示例：**

Creates a pie chart using a list of frequencies. The whole pie gives 100%, the provided data is shown as pie slices.  
PieChart({20, 15, 40, 5, 10, 20}) creates a pie chart with default center (0,0) and radius 3.  
Creates a pie chart with a given center and radius using a list of frequencies. The whole pie gives 100%, the provided  
data is shown as pie slices.  
PieChart({20, 15, 40, 5, 10, 20},(3,3),5) creates a pie chart with center (3,3) and radius 5.  
Select the Color tab of the Properties dialog window of the pie chart to choose among a wide selection of colors to  
customize each slice, and the Style tab to set the filling of each slice.

### ResidualPlot

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/ResidualPlot/>

**语法：**

```
ResidualPlot( <List of Points>, <Function> )
```

**说明 / 示例：**

Returns a list of points whose x-coordinates are equal to the x-coordinates of the elements of the given list, and  
y-coordinates are the residuals with respect to f.  
If the i-th element of the given list is a point (a,b) then i-th element of the result is (a,b-f(a)).  
Let  
list = {(-1, 1), (-0.51, 2), (0, 0.61), (0.51, -1.41), (0.54, 1.97), (1.11, 0.42), (1.21, 2.53), (-0.8, -0.12)} be  
the list of points and f(x) = x^5 + x^4 - x - 1 the function. The ResidualPlot(list, f ) command yields  
list1 = {(-1, 1), (-0.51, 2.46), (0, 1.61), (0.51, 0), (0.54, 3.38), (1.11, -0.66), (1.21, 0), (-0.8, 0)} and creates  
the corresponding points in  
Graphics View.

### StemPlot

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/StemPlot/>

**语法：**

```
StemPlot( <List> )
StemPlot( <List>, <Adjustment -1|0|1> )
```

**说明 / 示例：**

This command differs among variants of English:  
StemPlot (US)  
StemAndLeaf (UK + Aus)  
Returns a stem plot of the given list of numbers. Outliers are removed from the plot and listed separately.  
An outlier is defined as a value outside the interval [ Q1 - 1.5 (Q3 - Q1) , Q3 + 1.5 (Q3 - Q1) ].  
Returns a stem plot of the given list of numbers.  
If Adjustment = -1 the default stem unit is divided by 10  
If Adjustment = 0 nothing is changed  
If Adjustment = 1 the default stem unit is multiplied by 10

### StepGraph

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/StepGraph/>

**语法：**

```
StepGraph( <List of Points> )
StepGraph( <List of Points>, <Boolean Join> )
StepGraph( <List of x-coordinates>, <List of y-coordinates> )
StepGraph( <List of x-coordinates>, <List of y-coordinates>, <Boolean Join> )
StepGraph( <List of x-coordinates>, <List of y-coordinates>, <Boolean Join>, <Point Style> )
StepGraph( <List of Points>, <Boolean Join>, <Point Style> )
```

**说明 / 示例：**

Draws a step graph of the given list of points. Each point is connected to the next point in the list by a horizontal  
line segment.  
StepGraph({(1, 1), (3, 2), (4, 5), (5, 7)})  
Draws a step graph of the given list of points. If Join = false, then a horizontal line segment is drawn towards the  
x-coordinate of the next point, but a vertical line segment is not drawn. If Join = true, then each point is  
connected to the next point in the list by a horizontal and a vertical line segment.  
StepGraph({(1, 1), (3, 2), (4, 5), (5, 7)}, true)  
Draws a step graph of a list of points created from the given lists of coordinates. Each point is connected to the  
next point in the list by a horizontal line segment.  
StepGraph({1, 3, 4, 5}, {1, 2, 5, 7})  
Draws a step graph of a list of points created from the given lists of coordinates. If Join = false, then a  
horizontal line segment is drawn towards the x-coordinate of the next point, but a vertical line segment is not drawn.  
If Join = true, then each point is connected to the next point in the list by a horizontal and a vertical line  
segment.  
StepGraph({1, 3, 4, 5}, {1, 2, 5, 7}, true)  
Draws a step graph as described above.  
Point style values of -2, -1, 0, 1, -1 determine how points are drawn as follows:  
0 = no points are drawn  
1 = solid points on the right  
2 = solid points on the right, open points on the left  
-1 = solid points on the left  
-2 = solid points on the left, open points on the right  
StepGraph({1, 3, 4, 5}, {1, 2, 5, 7}, false, 1)  
Draws a step graph as described above.  
StepGraph({(1, 1), (3, 2), (4, 5), (5, 7)}, false, 1)

### StickGraph

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/StickGraph/>

**语法：**

```
StickGraph( <List of Points> )
StickGraph( <List of Points>, <Boolean Horizontal> )
StickGraph( <List of x-coordinates>, <List of y-coordinates> )
StickGraph( <List of x-coordinates>, <List of y-coordinates>, <Boolean Horizontal> )
```

**说明 / 示例：**

Draws a stick graph of the given points. For each point a vertical line segment is drawn from the x-axis to the point.  
StickGraph({(1, 1), (3, 2), (4, 5), (5, 7)})  
Draws a stick graph of the given points. If Horizontal = true, then horizontal line segments are drawn from the  
y-axis to each point. If Horizontal = false, then vertical line segments are drawn from the x-axis to each point.  
StickGraph({(1, 1), (3, 2), (4, 5), (5, 7)}, false)  
Draws a stick graph of points created from the two lists of coordinates. For each point a vertical line segment is  
drawn from the x-axis to the point.  
StickGraph({1, 3, 4, 5}, {1, 2, 5, 7})  
Draws a stick graph of points created from the two lists of coordinates. If Horizontal = true, then horizontal  
line segments are drawn from the y-axis to each point. If Horizontal = false, then vertical line segments are  
drawn from the x-axis to each point.  
StickGraph({1, 3, 4, 5}, {1, 2, 5, 7}, true)

## 圆锥曲线命令

> 共 32 个命令

### Axes

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Axes/>

**语法：**

```
Axes( <Conic> )
Axes( <Quadric> )
```

**说明 / 示例：**

Returns the equations of the major and minor axes of a conic section.  
See also MajorAxis and MinorAxis commands.  
Creates the 3 axes of the given quadric.  
Axes(x^2 + y^2 + z^2= 3) returns the three lines  
a: X = (0, 0, 0) + λ (1, 0, 0), b: X = (0, 0, 0) + λ (0, 1, 0) and c: X = (0, 0, 0) + λ (0, 0, 1)  
Specifically:  
if the given quadric is a cylinder, the command yields the two axes of the bottom circle and the rotation axis.  
if the given quadric is a sphere, the command yields the three axes parallel to the coordinate system axes.

### Center

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Center/>

**语法：**

```
Center( <Conic> )
Center( <Quadric> )
```

**说明 / 示例：**

This command differs among variants of English:  
Center (US)  
Centre (UK + Aus)  
Returns the center of a circle, ellipse, or hyperbola.  
Center(x^2 + 4 y^2 + 2x - 8y + 1 = 0) (,  
: Centre(x^2 + 4 y^2 + 2x - 8y + 1 = 0)) returns point A = (-1, 1)  
See also  
Midpoint or Center (,  
: Midpoint or Centre) tool .  
Creates the center of a quadric (e.g. sphere, cone, etc.).  
Center(x^2 + (y-1)^2 + (z-2)^2 = 1) yields (0, 1, 2)

### Circle

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Circle/>

**语法：**

```
Circle( <Point>, <Radius Number> )
Circle( <Point>, <Segment> )
Circle( <Point>, <Point> )
Circle( <Point>, <Point>, <Point> )
Circle( <Line>, <Point> )
Circle( <Point>, <Radius>, <Direction> )
Circle( <Point>, <Point>, <Direction> )
```

**说明 / 示例：**

Yields a circle with given center and radius.  
Yields a circle with given center and radius equal to the length of the given segment.  
Yields a circle with given center through a given point.  
Yields a circle through the three given points (if they do not lie on the same line).  
See also Compass,  
Circle with Center through Point,  
Circle with Center and Radius, and Circle through 3 Points tools.  
Creates a circle with line as axis and through the point.  
Creates a circle with center, radius, and axis parallel to direction, which can be a line, vector or plane.  
Creates a circle with center, through a point, and axis parallel to direction.  
In order to avoid the ambiguity line/plane of notations in 2D and 3D, don’t use equations like x = 0 or y = 0 for the Direction.  
For example, you want the Direction to be the plane x = 0, use an expression like x + 0y + 0z = 0 instead.  
See also Circle with Axis through Point and Circle with Center, Radius and Direction tools.

### Circumference

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Circumference/>

**语法：**

```
Circumference(Conic)
```

**说明 / 示例：**

If the given conic is a circle or ellipse, this command returns its circumference. Otherwise the result is undefined.  
Circumference(x^2 + 2y^2 = 1) yields 5.4.  
See also Perimeter command.

### Coefficients

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Coefficients/>

**语法：**

```
Coefficients( <Polynomial> )
Coefficients( <Conic> )
Coefficients( <Polynomial>, <Variable> )
```

**说明 / 示例：**

Yields the list of all coefficients (a_k,a\_{k-1},\ldots,a_1, a_0) of the polynomial  
(a_k x^k+a\_{k-1}x^{k-1}+\cdots+a_1 x+a_0).  
Coefficients(x^3 - 3 x^2 + 3 x) yields {1, -3, 3, 0}.  
For non-polynomial curves obtained using one the fitting commands e.g. f(x) = FitExp(l1), the command  
Coefficients(f) will return the list of the calculated parameters.  
Returns the list of the coefficients a, b, c, d, e, f of a conic in standard form: (a\cdot x^2 + b\cdot  
y^2 + c + d\cdot x\cdot y + e\cdot x + f\cdot y = 0)  
For a line in implicit form l: ax + by + c = 0 it is possible to obtain the coefficients using the syntax x(l),  
y(l), z(l).  
Given line l: 3x + 2y - 2 = 0:  
x(l) returns 3  
y(l) returns 2  
z(l) returns -2  
CAS Syntax  
Yields the list of all coefficients of the polynomial in the main variable.  
Coefficients(x^3 - 3 x^2 + 3 x) yields {1, -3, 3, 0}.  
Yields the list of all coefficients of the polynomial in the given variable.  
Coefficients(a^3 - 3 a^2 + 3 a, a) yields {1, -3, 3, 0}.  
Coefficients(a^3 - 3 a^2 + 3 a, x) yields {a³ - 3 a² + 3 a}.

### Conic

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Conic/>

**语法：**

```
Conic( <Point>, <Point>, <Point>, <Point>, <Point> )
Conic( <Number a>, <Number b>, <Number c>, <Number d>, <Number e>, <Number f> )
Conic( <List> )
```

**说明 / 示例：**

Returns a conic section through the five given points.  
Conic((0, -4), (2, 4), (3,1), (-2,3), (-3,-1)) yields 151x² - 37x y + 72y² + 14x - 42y = 1320 .  
If four of the points lie on one line, then the conic section is not defined.  
Returns a conic section (a\cdot x^2+d\cdot xy+b\cdot y^2+e\cdot x+f\cdot y=-c).  
Conic(2, 3, -1, 4, 2, -3) yields 2x² + 4x y + 3y² + 2x - 3y = 1 .  
Returns a conic section (a\cdot x^2+d\cdot xy+b\cdot y^2+e\cdot x+f\cdot y=-c).  
Conic({2, 3, -1, 4, 2, -3}) yields 2x² + 4x y + 3y² + 2x - 3y = 1 .  
See also  
Conic through 5 Points tool and Coefficients  
command.

### ConjugateDiameter

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/ConjugateDiameter/>

**语法：**

```
ConjugateDiameter( <Line>, <Conic> )
ConjugateDiameter( <Vector>, <Conic> )
```

**说明 / 示例：**

Returns the conjugate diameter of the diameter that is parallel to the given line (relative  
to the conic section).  
ConjugateDiameter(-4x + 5y = -2, x^2 + 4 y^2 + 2x - 8y + 1 = 0) yields line 5x + 16y = 11  
Returns the conjugate diameter of the diameter that is parallel to the given vector  
(relative to the conic section).  
Let u = (4,1) be a vector. Then ConjugateDiameter(u, x^2 + 4 y^2 + 2x - 8y + 1 = 0) yields line x + y = 0

### Curvature

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Curvature/>

**语法：**

```
Curvature( <Point>, <Object> )
```

**说明 / 示例：**

Yields the curvature of the object (function, curve, conic) at the given point.  
Curvature((0 ,0), x^2) yields 2  
Curvature((0, 0), Curve(cos(t), sin(2t), t, 0, π)) yields 0  
Curvature((-1, 0), Conic({1, 1, 1, 2, 2, 3})) yields 2

### Directrix

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Directrix/>

**语法：**

```
Directrix( <Conic> )
```

**说明 / 示例：**

Yields the directrix of the conic.  
Directrix(x^2 - 3x + 3y = 9) yields the line y = 4.5  
See also the Focus command.

### Eccentricity

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Eccentricity/>

**语法：**

```
Eccentricity( <Conic> )
```

**说明 / 示例：**

Calculates the eccentricity of the conic section.  
Eccentricity(x^2/9 + y^2/4 = 1) returns a = 0.75

### Ellipse

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Ellipse/>

**语法：**

```
Ellipse( <Focus>, <Focus>, <Semimajor Axis Length> )
Ellipse( <Focus>, <Focus>, <Segment> )
Ellipse( <Focus>, <Focus>, <Point> )
```

**说明 / 示例：**

Creates an ellipse with two focal points and semimajor axis length.  
Ellipse((0, 1), (1, 1), 1) yields 12x² + 16y² - 12x - 32y = -7.  
If the condition: 2*semimajor axis length > Distance between the focus points isn’t met, you will get an hyperbola.  
Creates an ellipse with two focal points, where the length of the semimajor axis equals the length of the given  
segment.  
Let s = Segment((0,1), (2,1)) : Ellipse((0, 1), (2, 1), s) yields 3x² + 4y² - 6x - 8y = 5.  
Creates an ellipse with two focal points passing through a given point.  
Ellipse((0, 1), (2, 1), (1,2)) yields 1x² + 2y² - 2x - 4y = -1.  
See also Ellipse tool .

### Focus

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Focus/>

**语法：**

```
Focus( <Conic> )
```

**说明 / 示例：**

Yields (all) foci of the conic section.  
Focus(4x^2 - y^2 + 16x + 20 = 0) returns the two foci of the given hyperbola: A=(-2, -2.24) and B=(-2,  
2.24).  
See also the Directrix command.

### Hyperbola

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Hyperbola/>

**语法：**

```
Hyperbola( <Focus>, <Focus>, <Semimajor Axis Length> )
Hyperbola( <Focus>, <Focus>, <Segment> )
Hyperbola( <Focus>, <Focus>, <Point> )
```

**说明 / 示例：**

Creates a hyperbola with given focus points and semimajor axis length.  
Hyperbola((0, -4), (2, 4), 1) yields -8xy - 15y² + 8y = -16.  
If the condition: 0 < 2*semimajor axis length < Distance between the focus points isn’t met, you will get an ellipse.  
Creates a hyperbola with given focus points where the length of the semimajor axis equals the length of the segment.  
Let a = Segment((0,1), (2,1)). Hyperbola((4, 1), (-2, 1), a) yields -5x² + 4y² + 10x - 8y = -19 .  
Creates a hyperbola with given focus points passing through a given point.  
Hyperbola((1, 1), (2, 1), (-2,-4)) yields -2.69x² + 1.30y² + 8.07x - 2.62y = 4.52 .  
See also  
Hyperbola tool .

### Incircle

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Incircle/>

**语法：**

```
Incircle( <Point>, <Point>, <Point> )
```

**说明 / 示例：**

Returns Incircle of the triangle formed by the  
three Points.  
Let O=(0, 0), A=(3, 0) and B=(0, 5) be three points: Incircle(O, A, B) yields (x - 1.08)² + (y - 1.08)² =  
1.18 in Algebra View and draws the  
corresponding circle in Graphics  
View.

### LinearEccentricity

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/LinearEccentricity/>

**语法：**

```
LinearEccentricity( <Conic> )
```

**说明 / 示例：**

Calculates the linear eccentricity of the conic section.  
For ellipses or hyperbolas the command gives the distance between the conic’s center and one of its foci, for circles  
it gives 0, and for parabolas gives the distance between its focus and the vertex.  
LinearEccentricity(4x^2 - y^2 + 16x + 20 = 0) returns 2.24

### MajorAxis

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/MajorAxis/>

**语法：**

```
MajorAxis( <Conic> )
```

**说明 / 示例：**

Returns the equation of the major axis of the conic section.  
MajorAxis(x^2 / 9 + y^2 / 4 = 1) returns y = 0.  
See also MinorAxis command.

### Midpoint

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Midpoint/>

**语法：**

```
Midpoint( <Segment> )
Midpoint( <Conic> )
Midpoint( <Interval> )
Midpoint( <Point>, <Point> )
Midpoint( <Quadric> )
```

**说明 / 示例：**

Returns the midpoint of the segment.  
Let s = Segment((1, 1), (1, 5)). Midpoint(s) yields (1, 3).  
Returns the center of the conic.  
Midpoint(x^2 + y^2 = 4) yields (0, 0).  
Returns the midpoint of the interval (as number).  
Midpoint(2 < x < 4) yields 3.  
Returns the midpoint of two points.  
Midpoint((1, 1), (5, 1)) yields (3, 1).  
Returns the midpoint of the given quadric (e.g. sphere, cone, etc.)  
Midpoint(x^2 + y^2 + z^2 = 1) yields (0, 0, 0).  
See also  
Midpoint or Center tool.

### MinorAxis

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/MinorAxis/>

**语法：**

```
MinorAxis( <Conic> )
```

**说明 / 示例：**

Returns the equation of the minor axis of the conic section.  
MinorAxis(x^2 / 9 + y^2 / 4 = 1) returns x = 0.  
See also MajorAxis command.

### OsculatingCircle

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/OsculatingCircle/>

**语法：**

```
OsculatingCircle( <Point>, <Function> )
OsculatingCircle( <Point>, <Curve> )
OsculatingCircle( <Point>, <Object> )
```

**说明 / 示例：**

Yields the osculating circle of the function in the given point.  
OsculatingCircle((0, 0), x^2) yields x² + y² - y = 0.  
Yields the osculating circle of the curve in the given point.  
OsculatingCircle((1, 0), Curve(cos(t), sin(2t), t, 0, 2π)) yields x² + y² + 6x = 7.  
Yields the osculating circle of the object (function, curve, conic) in the given point.  
OsculatingCircle((0, 0), x^2) yields x² + y² - y = 0  
OsculatingCircle((1, 0), Curve(cos(t), sin(2t), t, 0, 2π)) yields x² + y² + 6x = 7  
OsculatingCircle((-1, 0), Conic({1, 1, 1, 2, 2, 3})) yields x² + y² + 2x + 1y = -1  
This command is for 2D objects only. For 3D, you can make a custom tool for example  
<https://www.geogebra.org/m/tan7dxjt>

### Parabola

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Parabola/>

**语法：**

```
Parabola( <Point>, <Line> )
```

**说明 / 示例：**

Returns a parabola with focal point and the line as directrix.  
Let a = Line((0,1), (2,1)). Parabola((3, 3), a) yields x² - 6x - 4y = -17 .  
See also Parabola tool  
.

### Parameter

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Parameter/>

**语法：**

```
Parameter( <Parabola> )
```

**说明 / 示例：**

Returns the parameter of the parabola, which is the distance between the directrix and the focus.  
Parameter(y = x^2 - 3x + 5) returns 0.5.

### PathParameter

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/PathParameter/>

**语法：**

```
PathParameter( <Point On Path> )
```

**说明 / 示例：**

Returns the parameter (i.e. a number ranging from 0 to 1) of the point that belongs to a  
path.  
Let f(x) = x² + x - 1 and A is a point attached to this function with coordinates (1,1) (you can create such point using the point on object tool or A=Point(f), SetCoords(A,1,1) commands). Then PathParameter(A) yields a  
= 0.47.  
In the following table (f(x)=\frac{x}{1+|x|}) is a function used to map all real numbers into interval (-1,1) and  
(\phi(X,A,B)=\frac{\overrightarrow{AX}\cdot\overrightarrow{AB}}{|AB|^2}) is a linear map from line AB to reals  
which sends A to 0 and B to 1.  
Line AB  
(\frac{f(\phi(X,A,B))+1}2)  
Ray AB  
(f(\phi(X,A,B)))  
Segment AB  
(\phi(X,A,B))  
Circle with center C and radius r  
Point (X=C+(r\cdot \cos(\alpha),r\cdot \sin(\alpha))), where (\alpha\in ]-\pi,\pi]) has path parameter (\frac{\alpha+\pi}{2\pi})  
Ellipse with center C and semiaxes (\vec{a}), (\vec{b})  
Point (X=C+ \vec{a} \cdot \cos(\alpha) + \vec{b} \cdot \sin(\alpha) ) , where (\alpha\in ]-\pi,\pi]) has path parameter  
(\frac{\alpha+\pi}{2\pi})  
Hyperbola  
Point (X = C \pm \vec{a} · \cosh(t) + \vec{b} · \sinh(t)) has path parameter ( \frac{f(t)+1}{4})  
or (\frac{f(t)+3}{4})  
Parabola with vertex V and direction of axis (\vec{v}).  
Point (V+\frac{1}{2}p\cdot t^2\cdot  
\vec{v}+p\cdot t \cdot \vec{v}^{\perp}) has path parameter (\frac{f(t)+1}2).  
Polyline A1…An  
If X lies on AkAk+1, path parameter of X is (\frac{k-1+\phi(X,A,B)}{n-1})  
Polygon A1…An  
If X lies on AkAk+1 (using An+1=A1), path parameter of X is  
(\frac{k-1+\phi(X,A,B)}{n})  
List of paths L={p1,…,pn}  
If X lies on pk and path parameter of X w.r.t. pk is t, path parameter of X  
w.r.t.L is (\frac{k-1+t}{n})  
List of points L={A1,…,An}  
Path parameter of Ak is (\frac{k-1}{n}). Point[L,t] returns  
(A\_{\lfloor tn\rfloor+1}).  
Locus  
Implicit polynomial  
No formula available.

### Perimeter

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Perimeter/>

**语法：**

```
Perimeter( <Polygon> )
Perimeter( <Conic> )
Perimeter( <Locus> )
```

**说明 / 示例：**

Returns the perimeter of the polygon.  
Perimeter(Polygon((1, 2), (3, 2), (4, 3))) yields 6.58.  
If the given conic is a circle or ellipse, this command returns its perimeter. Otherwise the result is undefined.  
Perimeter(x^2 + 2y^2 = 1) yields 5.4.  
If the given locus is finite, this command returns its approximate perimeter. Otherwise the result is undefined.  
See also Circumference command.

### Polar

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Polar/>

**语法：**

```
Polar( <Point>, <Conic> )
Polar(<Line>, <Conic>)
```

**说明 / 示例：**

Creates the polar line of the given point relative to the conic section.  
Polar((0,2), y = x^2 - 3x + 5) creates the line 1.5x + 0.5y = 4  
See also  
Polar or Diameter Line tool.  
Creates the pole, given a polar line and a conic.  
Polar(1.5x+0.5y=4, y = x^2 - 3x + 5) creates the point (0, 2)

### Radius

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Radius/>

**语法：**

```
Radius( <Conic> )
```

**说明 / 示例：**

Returns the radius of a conic.  
Returns the radius of a circle c (e.g. c:(x - 1)² + (y - 1)² = 9) Radius(c) yields a = 3.  
Returns the radius of a circle formula Radius((x - 2)² + (y - 2)² = 16) yields a = 4.

### Sector

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Sector/>

**语法：**

```
Sector( <Conic>, <Point>, <Point> )
Sector( <Conic>, <Parameter Value>, <Parameter Value> )
```

**说明 / 示例：**

Yields a conic sector between two points on the conic section and calculates its area.  
Let c: x^2 + 2y^2 = 8 be an ellipse, D = (-2.83, 0) and E = (0, -2) two points on the ellipse.  
Sector(c, D, E) yields d = 4.44.  
Let c: x^2 + y^2 = 9 be a circle, A = (3, 0) and B = (0, 3) two points on the circle.  
Sector(c, A, B) yields d = 7.07  
This works only for a circle or ellipse.  
Yields a conic sector between two parameter values between 0 and 2π on the conic section and calculates its area.  
Let c: x^2 + y^2 = 9 be a circle. Sector(c, 0, 3/4 π) yields d = 10.6  
Internally the following parametric forms are used:  
Circle: (r cos(t), r sin(t)) where r is the circle’s radius.  
Ellipse: (a cos(t), b sin(t)) where a and b are the lengths of the semimajor and semiminor axes.

### SemiMajorAxisLength

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/SemiMajorAxisLength/>

**语法：**

```
SemiMajorAxisLength( <Conic> )
```

**说明 / 示例：**

Returns the length of the semimajor axis (half of the major axis) of the conic section.  
SemiMajorAxisLength((x - 1)^2 + (y - 2)^2 = 4) yields 2.  
See also SemiMinorAxisLength command.

### SemiMinorAxisLength

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/SemiMinorAxisLength/>

**语法：**

```
SemiMinorAxisLength( <Conic> )
```

**说明 / 示例：**

Returns the length of the semiminor axis (half of the minor axis) of the conic section.  
SemiMinorAxisLength(x^2 + 2y^2 - 2x - 4y = 5) yields 2.  
See also SemiMajorAxisLength command.

### Semicircle

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Semicircle/>

**语法：**

```
Semicircle( <Point>, <Point> )
```

**说明 / 示例：**

Creates a semicircle above the segment between the two points and displays its length in Algebra View.  
See also  
Semicircle tool.

### Tangent

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Tangent/>

**语法：**

```
Tangent( <Point>, <Conic> )
Tangent( <Point>, <Function> )
Tangent( <Point on Curve>, <Curve> )
Tangent( <x-Value>, <Function> )
Tangent( <Line>, <Conic> )
Tangent( <Circle>, <Circle> )
Tangent( <Point>, <Spline> )
Tangent( <Point>, <Implicit Curve> )
```

**说明 / 示例：**

Creates (all) tangents through the point to the conic section.  
Tangent((5, 4), 4x^2 - 5y^2 = 20) yields x - y = 1.  
Creates the tangent to the function at x = x(A).  
Tangent((1, 0), x^2) yields y = 2x - 1.  
x(A) is the x-coordinate of the given point A.  
Creates the tangent to the curve in the given point.  
Tangent((0, 1), Curve(cos(t), sin(t), t, 0, π)) yields y = 1.  
Creates the tangent to the function at x-Value.  
Tangent(1, x^2) yields y = 2x - 1.  
Creates (all) tangents to the conic section that are parallel to the given line.  
Tangent(y = 4, x^2 + y^2 = 4) yields y = 2 and y = -2.  
Creates the common tangents to the two Circles (up to 4).  
Tangent(x^2 + y^2 = 4, (x - 6)^2 + y^2 = 4) yields y = 2, y = -2, 1.49x + 1.67y = 4.47 and -1.49x + 1.67y =  
-4.47.  
Creates the tangent to the spline in the given point.  
Let A = (0, 1), B = (4, 4) and C = (0, 4). Tangent(A, Spline({A, B, C})) yields line a: y = 0.59x + 1.  
Creates the tangent to the implicit curve in the given point.  
Tangent((1,1), x^2+y^2=1) yields lines x=1 and y=1.  
See also Tangents tool.

### Type

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Type/>

**语法：**

```
Type( <Object> )
```

**说明 / 示例：**

For conics and quadrics this command returns a number representing the conic/quadric type according to the table below.  
In this context, an empty conic (or quadric) is one whose coefficients are defined, but that does not contain any real  
point, e.g. x2 + y2 = -1. For conics, GeoGebra distinguishes double line (special case of parallel lines with distance  
0\) and single line (special case of circle with infinite diameter, may result from circle inversion). For quadrics there  
is no such distinction.  
Type(x²+y²=1) yields 4 which stands for circle.  
Value  
Type of conic  
Type of quadric  
1  
Single point  
Single point  
2  
Intersecting lines  
3  
Ellipse  
Ellipsoid  
4  
Circle  
Sphere  
5  
Hyperbola  
6  
Empty  
Empty  
7  
Double line  
8  
Parallel lines  
9  
Parabola  
Paraboloid  
10  
Line  
Line  
30  
Cone  
31  
Cylinder  
33  
Plane  
34  
Parallel planes  
35  
Intersecting planes  
36  
Hyperboloid of one sheet  
37  
Hyperboloid of two sheets  
38  
Parabolic cylinder  
39  
Hyperbolic cylinder  
40  
Hyperbolic paraboloid

### Vertex

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Vertex/>

**语法：**

```
Vertex( <Conic> )
Vertex( <Inequality> )
Vertex( <Polygon> )
Vertex( <Polygon>, <Index n> )
Vertex( <Segment>, <Index> )
```

**说明 / 示例：**

Returns (all) vertices of the conic section.  
Returns the points of intersection of the borders.  
Vertex((x + y < 3) && (x - y > 1)) returns point A = (2, 1).  
{Vertex((x + y < 3) ∧ (x - y > 1) && (y > - 2))} returns list1 = {(2, 1), (5, -2), (-1, -2)}.  
Vertex((y > x²) ∧ (y < x)) returns two points A = (0, 0) and B = (1, 1).  
{Vertex((y > x²) ∧ (y < x))} returns list1 = {(0, 0), (1, 1)}.  
Returns (all) vertices of the polygon.  
Returns n-th vertex of the polygon.  
To get the vertices of the objects polygon / conic / inequality in a list, use {Vertex(Object)}.  
Returns the start-point (Index = 1) or end-point (Index = 2) of the Segment.

## 离散数学命令

> 共 6 个命令

### ConvexHull

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/ConvexHull/>

**语法：**

```
ConvexHull( <List of Points> )
```

**说明 / 示例：**

Creates convex hull of given set of points. Returned object is a  
locus, so it is auxiliary.

### DelaunayTriangulation

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/DelaunayTriangulation/>

**语法：**

```
DelaunayTriangulation( <List of Points> )
```

**说明 / 示例：**

Creates a Delaunay Triangulation of the list of points. Returned  
object is a locus, so it is auxiliary.

### MinimumSpanningTree

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/MinimumSpanningTree/>

**语法：**

```
MinimumSpanningTree( <List of Points> )
```

**说明 / 示例：**

Returns the minimum spanning tree of a complete graph on given vertices in which weight of edge (u,v) is the  
Euclidian distance between u and v. The resulting object is a locus.

### ShortestDistance

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/ShortestDistance/>

**语法：**

```
ShortestDistance( <List of Segments>, <Start Point>, <End Point>, <Boolean Weighted> )
```

**说明 / 示例：**

Finds shortest path between start point and endpoint in a graph  
given by list of segments. If weighted is false,  
weight of each edge is supposed to be 1  
(i.e. we are looking for the path with least number of edges), otherwise it is the length of given segment (we are  
looking for the geometrically shortest path).

### TravelingSalesman

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/TravelingSalesman/>

**语法：**

```
TravelingSalesman( <List of Points> )
```

**说明 / 示例：**

This command differs among variants of English:  
TravelingSalesman (US)  
TravellingSalesman (UK + Aus)  
Returns the shortest closed path which goes through each point exactly once. Returned object is a  
locus, so it is auxiliary.

### Voronoi

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Voronoi/>

**语法：**

```
Voronoi( <List of Points> )
```

**说明 / 示例：**

Draws the Voronoi diagram for given list of points. Returned object is a  
locus, so it is auxiliary.

## 函数与微积分命令

> 共 73 个命令

### Asymptote

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Asymptote/>

**语法：**

```
Asymptote( <Conic> )
Asymptote( <Function> )
Asymptote( <Implicit Curve> )
```

**说明 / 示例：**

Yields both asymptotes of the conic.  
Asymptote(x^2 - y^2 /4 = 1) returns line -2x + y = 0 and line -2x - y = 0.  
GeoGebra will attempt to find the asymptotes of the function and return them in a list. It may not find them all, for  
example vertical asymptotes of non-rational functions such as ln(x). This syntax is not available in the Graphing and  
Geometry Apps  
Asymptote((x^3 - 2x^2 - x + 4) / (2x^2 - 2)) returns the list {y = 0.5x - 1, x = 1, x = -1}.  
Yields a list containing all the asymptotes of the Implicit Curve.  
Asymptote(x^3 + y^3 + y^2 - 3 x = 0) returns the list {x + y = -0.33}.

### Coefficients

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Coefficients/>

**语法：**

```
Coefficients( <Polynomial> )
Coefficients( <Conic> )
Coefficients( <Polynomial>, <Variable> )
```

**说明 / 示例：**

Yields the list of all coefficients (a_k,a\_{k-1},\ldots,a_1, a_0) of the polynomial  
(a_k x^k+a\_{k-1}x^{k-1}+\cdots+a_1 x+a_0).  
Coefficients(x^3 - 3 x^2 + 3 x) yields {1, -3, 3, 0}.  
For non-polynomial curves obtained using one the fitting commands e.g. f(x) = FitExp(l1), the command  
Coefficients(f) will return the list of the calculated parameters.  
Returns the list of the coefficients a, b, c, d, e, f of a conic in standard form: (a\cdot x^2 + b\cdot  
y^2 + c + d\cdot x\cdot y + e\cdot x + f\cdot y = 0)  
For a line in implicit form l: ax + by + c = 0 it is possible to obtain the coefficients using the syntax x(l),  
y(l), z(l).  
Given line l: 3x + 2y - 2 = 0:  
x(l) returns 3  
y(l) returns 2  
z(l) returns -2  
CAS Syntax  
Yields the list of all coefficients of the polynomial in the main variable.  
Coefficients(x^3 - 3 x^2 + 3 x) yields {1, -3, 3, 0}.  
Yields the list of all coefficients of the polynomial in the given variable.  
Coefficients(a^3 - 3 a^2 + 3 a, a) yields {1, -3, 3, 0}.  
Coefficients(a^3 - 3 a^2 + 3 a, x) yields {a³ - 3 a² + 3 a}.

### ComplexRoot

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/ComplexRoot/>

**语法：**

```
ComplexRoot( <Polynomial> )
```

**说明 / 示例：**

Finds the complex roots of a given polynomial in x. Points are created in Graphics View.  
ComplexRoot(x^2 + 4) yields (0 + 2 ί) and (0 - 2 ί)  
CAS Syntax  
Finds the complex roots of a given polynomial in x.  
ComplexRoot(x^2 + 4) yields {- 2 ί, 2 ί}  
Use CSolve Command instead.

### Cubic

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Cubic/>

**语法：**

```
Cubic( <Point>, <Point>, <Point>, <Number> )
```

**说明 / 示例：**

Gives n-th triangle cubic of the given triangle ABC.  
Let A = (0, 1), B = (2, 1) and C = (1, 2). Cubic(A, B, C, 2) yields the implicit curve -x³ + 3x² + 5x y² -  
14x y + 7x - 5y² + 14y = 9.  
This command is in development, set of supported index n is changing.  
Some common triangle cubics  
Index n  
Cubic  
1  
Neuberg Cubic  
2  
Thomson Cubic  
3  
McCay Cubic  
4  
Darboux Cubic  
5  
Napoleon/Feuerbach Cubic  
7  
Lucas Cubic  
17  
1st Brocard Cubic  
18  
2nd Brocard Cubic

### Curvature

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Curvature/>

**语法：**

```
Curvature( <Point>, <Object> )
```

**说明 / 示例：**

Yields the curvature of the object (function, curve, conic) at the given point.  
Curvature((0 ,0), x^2) yields 2  
Curvature((0, 0), Curve(cos(t), sin(2t), t, 0, π)) yields 0  
Curvature((-1, 0), Conic({1, 1, 1, 2, 2, 3})) yields 2

### CurvatureVector

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/CurvatureVector/>

**语法：**

```
CurvatureVector( <Point>, <Object> )
```

**说明 / 示例：**

Yields the curvature vector of the object (function, curve, conic) in the given point.  
CurvatureVector((0, 0), x^2) yields vector (0, 2)  
CurvatureVector((0, 0), Curve(cos(t), sin(2t), t, 0, π)) yields vector (0, 0)  
CurvatureVector((-1, 0), Conic({1, 1, 1, 2, 2, 3})) yields vector (0, -2)

### Curve

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Curve/>

**语法：**

```
Curve( <Expression>, <Expression>, <Parameter Variable>, <Start Value>, <End Value> )
Curve( <Expression> , <Expression> , <Expression> , <Parameter Variable> , <Start Value> , <End Value> )
```

**说明 / 示例：**

Yields the Cartesian parametric curve for the given x-expression (first <Expression>) and  
y-expression (second <Expression>) (using parameter variable) within the given interval [Start Value, End  
Value].  
Curve(2 cos(t), 2 sin(t), t, 0, 2π) creates a circle with radius 2 around the origin of the coordinate system.  
Yields the 3D Cartesian parametric curve for the given x-expression (first <Expression>), y-expression (second  
<Expression>) and z-expression (third <Expression>) (using parameter variable) within the given interval [Start  
Value, End Value].  
Curve(cos(t), sin(t), t, t, 0, 10π) creates a 3D spiral.  
End Value must be greater than or equal to Start Value and both must be finite.  
x, y and z are not allowed as parameter variables.  
See Curves for details, also see the Derivative Command and the  
Parametric Derivative Command.

### DataFunction

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/DataFunction/>

**语法：**

```
DataFunction( <List of Numbers>, <List of Numbers> )
```

**说明 / 示例：**

Yields a function that connects points (x1, y1), (x2, y2),…,(xn, yn) where {x1, …, xn}, {y1,  
…, yn} are the input lists. In between these points linear interpolation is used. This command is used by Sensors.  
DataFunction({0, 1, 2, 4}, {0, 1, 4, 16}) yields a function that goes through points (0, 0), (1,1), (2, 4), (4,  
16).

### Degree

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Degree/>

**语法：**

```
Degree( <Polynomial> )
Degree( <Polynomial>, <Variable> )
```

**说明 / 示例：**

Gives the degree of a polynomial (in the main variable).  
Degree(x^4 + 2 x^2) yields 4  
CAS Syntax  
Gives the degree of a polynomial (in the main variable or  
monomial).  
Degree(x^4 + 2 x^2) yields 4  
Degree(x^6 y^3 + 2 x^2 y^3) yields 9  
Gives the degree of a polynomial in the given variable.  
Degree(x^4 y^3 + 2 x^2 y^3, x) yields 4  
Degree(x^4 y^3 + 2 x^2 y^3, y) yields 3

### Denominator

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Denominator/>

**语法：**

```
Denominator( <Function> )
Denominator( <Number> )
Denominator( <Expression> )
```

**说明 / 示例：**

Returns the denominator of a function.  
Denominator(5 / (x^2 + 2)) yields f(x)=(x2 + 2).  
For a rational number returns its (simplified) denominator. It uses a numerical method, which limits this command to numbers with  
small denominator. For irrational input the denominator of its continued  
fraction is returned.  
Denominator(5 / 3) yields 3.  
Denominator(10 / 6) yields 3.  
Denominator(15 / 3) yields 1.  
See also Numerator Command and FractionText Command.  
CAS Syntax  
Returns the denominator of a rational number or expression.  
Denominator(2 / 3 + 1 / 15) yields 15.

### Derivative

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Derivative/>

**语法：**

```
Derivative( <Function> )
Derivative( <Function>, <Number> )
Derivative( <Function>, <Variable> )
Derivative( <Function>, <Variable>, <Number> )
Derivative( <Curve> )
Derivative( <Curve>, <Number> )
Derivative( <Expression> )
Derivative( <Expression>, <Variable> )
Derivative( <Expression>, <Variable>, <Number> )
```

**说明 / 示例：**

Returns the derivative of the function with respect to the main variable.  
Derivative(x^3 + x^2 + x) yields 3x² + 2x + 1.  
Returns the nth derivative of the function with respect to the main variable, whereupon n equals <Number>.  
Derivative(x^3 + x^2 + x, 2) yields 6x + 2.  
Returns the partial derivative of the function with respect to the given variable.  
Derivative(x^3 y^2 + y^2 + xy, y) yields 2x³y + x + 2y.  
Returns the nth partial derivative of the function with respect to the given variable, whereupon n equals  
<Number>.  
Derivative(x^3 + 3x y, x, 2) yields 6x.  
Returns the derivative of the curve.  
Derivative(Curve(cos(t), t sin(t), t, 0, π)) yields curve x = -sin(t), y = sin(t) + t cos(t).  
This only works for parametric curves.  
Returns the nth derivative of the curve, whereupon n equals <Number>.  
Derivative(Curve(cos(t), t sin(t), t, 0, π), 2) yields curve x = -cos(t), y = 2cos(t) - t sin(t).  
This only works for parametric curves.  
You can use f'(x) instead of Derivative(f), or f''(x) instead of Derivative(f, 2), and so on.  
CAS Syntax  
Returns derivative of an expression with respect to the main variable.  
Derivative(x^2) yields 2x.  
Returns derivative of an expression with respect to the given variable.  
Derivative(a x^3, a) yields x³.  
Returns the nth derivative of an expression with respect to the given variable, whereupon n equals <Number>.  
Derivative(y x^3, x, 2) yields 6xy.  
Derivative(x³ + 3x y, x, 2) yields 6x.

### Extremum

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Extremum/>

**语法：**

```
Extremum( <Polynomial> )
Extremum( <Function>, <Start x-Value>, <End x-Value> )
Extremum( <Function> )
```

**说明 / 示例：**

This command differs among variants of English:  
Extremum (US)  
TurningPoint (UK + Aus)  
Yields all local extrema of the polynomial function as points on the function graph.  
Extremum(x³ + 3x² - 2x + 1) creates local extrema (0.29, 0.70) and (-2.29, 9.30) and shows them in the  
Graphics  
View.  
Calculates (numerically) the extremum of the function in the open interval ( <Start x-Value>, <End x-Value> ).  
Extremum((x⁴ - 3x³ - 4x² + 4) / 2, 0, 5) creates local extremum (2.93, -16.05) in the given interval and shows  
it in the  
Graphics View.  
The function should be continuous in [ <Start x-Value>, <End x-Value> ], otherwise false extrema near discontinuity  
might be calculated.  
CAS Syntax  
Will attempt to return all local extrema of the function (which should be continuous and differentiable)  
Extremum(x³ + 3x² - 2x + 1) creates a list of the points and plots them ( \left{ \left(\frac{-\sqrt{15}

- 3}{3}, \frac{10 ; \sqrt{15} + 45}{9} \right), \left(\frac{\sqrt{15} - 3}{3}, \frac{-10 ; \sqrt{15} +    
  45}{9} \right) \right}).    
  Assume(0 < x < 20, Extremum(15/2 \* sin( 2/15\*pi \* x) + 56/5)) yields the local turning points in the range given    
  ( \left{ \left(\frac{15}{4}, \frac{187}{10} \right), \left(\frac{45}{4}, \frac{37}{10} \right),    
  \left(\frac{75}{4}, \frac{187}{10} \right) \right} ).

### Factor

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Factor/>

**语法：**

```
Factor( <Polynomial> )
Factor( <Number> )
Factor( <Expression>, <Variable> )
```

**说明 / 示例：**

This command differs among variants of English:  
Factor (US)  
Factorise (UK + Aus)  
Factors the polynomial.  
Factor(x^2 + x - 6) yields (x - 2) (x + 3).  
This command needs to load the Computer Algebra System, so can be slow on some computers.  
CAS Syntax  
In the CAS View you can also  
use the following syntax:  
Expresses a number in its prime factorization  
Factor(360) yields 2³ 3² 5.  
Factors an expression with respect to a given variable.  
Factor(x^2 - y^2, x) yields (x - y) (x + y), the factorization of x2 - y2 with respect to x,  
Factor(x^2 - y^2, y) yields -(y - x) (y + x), the factorization of x2 - y2 with respect to y.  
This command factors expressions over the Rational Numbers. To factor over  
irrational real numbers, see the IFactor Command. To factor over complex numbers, see the  
CFactor Command and CIFactor Command.

### Factors

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Factors/>

**语法：**

```
Factors( <Polynomial> )
Factors( <Number> )
```

**说明 / 示例：**

Gives a list of lists of the type {factor, exponent} such that the product of all these factors raised to the power  
of the corresponding exponents equals the given polynomial. The factors are sorted by degree in ascending order.  
Factors(x^8 - 1) yields {{x - 1, 1}, {x + 1, 1}, {x^2 + 1, 1}, {x^4 + 1, 1}}.  
Not all of the factors are irreducible over the reals.  
Gives matrix of the type (\left( \begin{array}{ll} prime_1 & exponent_1 \ prime_2 & exponent_2 \prime_3 &  
exponent_3 \ \end{array} \right) ) such that the product of all these primes raised to the power of the  
corresponding exponents equals the given number. The primes are sorted in ascending order.  
Factors(1024) yields ( 2 10 ), since (1024 = 2^{10}).  
Factors(42) yields (\left( \begin{array}{ll} 2 & 1 \ 3 & 1 \7 & 1 \ \end{array} \right) ), since  
(42 = 2^1・3^1・7^1).  
See also PrimeFactors Command and Factor Command.  
In the CAS View undefined  
variables can be used as input and the results are returned as proper matrices.  
Factors(a^8 - 1) yields (\left( \begin{array}{cc} a - 1 & 1 \ a +1 & 1 \a^2 + 1& 1 \a^4 + 1& 1 \  
\end{array} \right)).

### Function

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Function/>

**语法：**

```
Function( <List of Numbers> )
Function( <Expression>, <Parameter Variable 1>, <Start Value>, <End Value>, <Parameter Variable 2>, <Start Value>, <End Value> )
```

**说明 / 示例：**

Yields the following function: The first two numbers determine the start x-value and the end x-value. The rest of  
the numbers are the y-values of the function in between in equal distances.  
Function[{2, 4, 0, 1, 0, 1, 0}] yields a triangular wave between x = 2 and x = 4.  
Function[{-3, 3, 0, 1, 2, 3, 4, 5}] yields a linear equation with slope = 1 between x = -3 and x = 3.  
Function(Function, Start x-value, End x-value)  
Restricts the visualization of the given function to the interval [Start x-value, End x-value].  
Function(x + 2, 1, 2) restricts the visualization of the graph of the function y = x + 2 to the interval [1, 2].  
Restricts the visualization of the representative surface of a function of two variables in 3D space.  
The expression a(x, y) = x + 0y creates a function of two variables, whose graph in 3D space is the  
plane z = a(x, y) = x.Function[u, u, 0, 3, v, 0, 2] creates the function of two  
variables b(u, v) = u, whose graph in 3D space is the rectangle Polygon[(0, 0, 0), (3, 0, 3),  
(3, 2, 3), (0, 2, 0)] contained in plane z = a(x,y) = x.

### ImplicitCurve

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/ImplicitCurve/>

**语法：**

```
ImplicitCurve( <List of Points> )
ImplicitCurve( <f(x,y)> )
```

**说明 / 示例：**

Creates implicit curve through given set of points. The length of the list must be  
(\frac{n(n+3)}2) for implicit curve of degree (n).  
Creates the implicit curve f(x,y) = 0.

### ImplicitDerivative

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/ImplicitDerivative/>

**语法：**

```
ImplicitDerivative( <f(x, y)> )
ImplicitDerivative( <Expression>, <Dependent Variable>, <Independent Variable> )
```

**说明 / 示例：**

Gives the implicit derivative of the given expression.  
ImplicitDerivative(x + 2 y) yields -0.5.  
CAS Syntax  
Gives the implicit derivative of the given expression.  
ImplicitDerivative(x + 2 y) yields -(\frac{1}{2}).  
Gives the implicit derivative of the given expression.  
ImplicitDerivative(x^2 + y^2, y, x) yields -(\frac{x}{y}).  
See also Derivative Command.

### InflectionPoint

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/InflectionPoint/>

**语法：**

```
InflectionPoint( <Polynomial> )
InflectionPoint( <Function> )
```

**说明 / 示例：**

Yields all inflection points of the polynomial as points on the function graph.  
InflectionPoint[x^3] yields (0, 0).  
CAS Syntax  
Yields all inflection points of the function (where possible) as a list.  
InflectionPoint[x exp(-x)] yields ( \left{ \left(2, \frac{2}{\textit{e}^{2}} \right) \right} ).

### Integral

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Integral/>

**语法：**

```
Integral( <Function> )
Integral( <Function>, <Variable> )
Integral( <Function>, <Start x-Value>, <End x-Value> )
Integral( <Function>, <Start x-Value>, <End x-Value>, <Boolean Evaluate> )
Integral( <Function>, <Variable>, <Start Value>, <End Value> )
```

**说明 / 示例：**

Gives the indefinite integral with respect to the main variable.  
Integral(x³) gives (\frac{1}{4}x^4) .  
Gives the partial integral with respect to the given variable.  
Integral(x³+3x y, x) gives (\frac{1}{4}x^4+\frac{3}{2}x^2 y) .  
Gives the definite integral over the interval [Start x-Value , End x-Value] with respect to the main variable.  
Integral(x³, 1, 2) yields 3.75.  
This command also shades the area between the function graph of f and the x-axis.  
Gives the definite integral of the function over the interval [Start x-Value , End x-Value] with respect to the main  
variable and shades the related area if Evaluate is true. In case Evaluate is false the related area is shaded  
but the integral value is not calculated.  
CAS Syntax  
In the CAS View undefined  
variables are allowed as input as well.  
Integral(cos(a t), t) yields (\frac{sin(a t)}{a} + c_1).  
Gives the definite integral over the interval [Start Value , End Value] of the given variable.  
Integral(cos(t), t, a, b) yields (- sin(a) + sin(b)).  
The answer isn’t guaranteed to be continuous, eg Integral(floor(x)), that is the integral of the function ⌊x⌋ -  
in that case you can define your own function to use eg F(x)=(floor(x)² - floor(x))/2 + x floor(x) - floor(x)²,  
i.e. the function (\frac{⌊x⌋² - ⌊x⌋}{2} + x \cdot⌊x⌋ - ⌊x⌋²)  
in some versions of GeoGebra, a numerical algorithm is used so integrating up to an asypmtote or similar eg  
Integral(ln(x), 0, 1) won’t work. In this case try Integral(ln(x), 0, 1, false)

### IntegralBetween

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/IntegralBetween/>

**语法：**

```
IntegralBetween( <Function>, <Function>, <Number>, <Number> )
IntegralBetween( <Function>, <Function>, <Number>, <Number>, <Boolean Evaluate> )
IntegralBetween( <Function>, <Function>, <Variable>, <Number>, <Number> )
```

**说明 / 示例：**

Gives the definite integral of the difference f(x) ‐ g(x) of two function f and g over the interval [a, b],  
where a is the first number and b the second, with respect to the main variable.  
IntegralBetween(sin(x), cos(x), 0, pi) yields 2.  
This command also shades the area between the function graphs of f and g.  
Gives the definite integral of the difference f(x) ‐ g(x) of two function f and g over the interval [a, b],  
where a is the first number and b the second, with respect to the main variable and shadows the related area if  
Evaluate is true. In case Evaluate is false the related area is shaded but the integral value is not calculated.  
CAS Syntax  
Gives the definite integral of the difference f(x) ‐ g(x) of two function f and g over the interval [a, b],  
where a is the first number and b the second, with respect to the main variable.  
IntegralBetween(sin(x), cos(x), pi / 4, pi * 5 / 4) yields (2 \sqrt{2}).  
Gives the definite integral of a variable of the difference f(x) ‐ g(x) of two function f and g over the  
interval [a, b], where a is the first number and b the second, with respect to the given variable.  
IntegralBetween(a \* sin(t), a \* cos(t), t, pi / 4, pi \* 5 / 4) yields (2 \sqrt{2} a).

### IntegralSymbolic

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/IntegralSymbolic/>

**语法：**

```
IntegralSymbolic(<Function>)
IntegralSymbolic(<Function>, <Variable>)
```

**说明 / 示例：**

CAS Syntax  
Gives the indefinite symbolic integral with respect to the main variable. The constant of integration c is not shown  
automatically as a slider.  
IntegralSymbolic(3x^2) yields (x^3+c\_{1}).  
Gives the partial symbolic integral with respect to the given variable. The constant of integration c is not shown  
automatically as a slider.  
IntegralSymbolic(x³+3x y, x) gives ( \frac{1}{4}x^4) + (\frac{3}{2} x² y+c\_{1} ) .

### Intersect

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Intersect/>

**语法：**

```
Intersect( <Object>, <Object> )
Intersect( <Object>, <Object>, <Index of Intersection Point> )
Intersect( <Object>, <Object>, <Initial Point> )
Intersect( <Function>, <Function>, <Start x-Value>, <End x-Value> )
Intersect( <Curve 1>, <Curve 2>, <Parameter 1>, <Parameter 2> )
Intersect( <Function>, <Function> )
Intersect( <Line> , <Object> ) creates the intersection point(s) of a line and a plane, segment, polygon, conic,
Intersect( <Plane> , <Object> ) creates the intersection point(s) of a plane and segment, polygon, conic, etc.
Intersect( <Conic>, <Conic> ) creates the intersection point(s) of two conics
Intersect( <Plane>, <Plane> ) creates the intersection line of two planes
Intersect( <Plane>, <Polyhedron> ) creates the polygon(s) intersection of a plane and a polyhedron.
Intersect( <Sphere>, <Sphere> ) creates the circle intersection of two spheres
Intersect( <Plane>, <Quadric> ) creates the conic intersection of the plane and the quadric (sphere, cone,
```

**说明 / 示例：**

Yields the intersection points of two objects.  
Let a: -3x + 7y = -10 be a line and c: x^2 + 2y^2 = 8 be an ellipse. Intersect(a, c) yields the  
intersection points E = (-1.02, -1.87) and F = (2.81, -0.22) of the line and the ellipse.  
Intersect(y = x + 3, Curve(t, 2t, t, 0, 10)) yields A=(3, 6).  
Intersect(Curve(2s, 5s, s,-10, 10), Curve(t, 2t, t, -10, 10)) yields A=(0, 0).  
Yields the nth intersection point of two objects. Each object must be a line, conic, polynomial function or implicit  
curve.  
Let a(x) = x^3 + x^2 - x be a function and b: -3x + 5y = 4 be a line. Intersect(a, b, 2) yields the  
intersection point C = (-0.43, 0.54) of the function and the line.  
Yields an intersection point of two objects by using a numerical, iterative method with initial point.  
Let a(x) = x^3 + x^2 - x be a function, b: -3x + 5y = 4 be a line, and C = (0, 0.8) be the initial point.  
Intersect(a, b, C) yields the intersection point D = (-0.43, 0.54) of the function and the line by using a  
numerical, iterative method.  
Yields the intersection points numerically for the two functions in the given interval.  
Let f(x) = x^3 + x^2 - x and g(x) = 4 / 5 + 3 / 5 x be two functions. Intersect(f, g, -1, 2) yields  
the intersection points A = (-0.43, 0.54) and B = (1.1, 1.46) of the two functions in the interval [ -1, 2 ].  
Finds one intersection point using a numerical, iterative method starting at the given parameters.  
Let a = Curve(cos(t), sin(t), t, 0, π) and b = Curve(cos(t) + 1, sin(t), t, 0, π).  
Intersect(a, b, 0, 2) yields the intersection point A = (0.5, 0.87).  
CAS Syntax  
Yields a list containing the intersection points of two objects.  
Let f(x):= x^3 + x^2 - x and g(x):= x be two functions. Intersect(f(x), g(x)) yields the intersection  
points list: {(1, 1), (0, 0), (-2, -2)} of the two functions.  
etc.  
cylinder, …)  
to get all the intersection points in a list you can use eg {Intersect(a,b)}  
See also IntersectConic and IntersectPath  
commands.  
See also  
Intersect tool.

### Invert

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Invert/>

**语法：**

```
Invert( <Matrix> )
Invert( <Function> )
```

**说明 / 示例：**

Inverts the given matrix.  
Invert({{1, 2}, {3, 4}}) yields (\begin{pmatrix}-2 & 1\1.5 & -0.5\end{pmatrix}), the inverse matrix of  
(\begin{pmatrix}1 & 2\3 & 4\end{pmatrix}).  
In the CAS View undefined  
variables are allowed too.  
Invert({{a, b}, {c, d}}) yields (\begin{pmatrix}\frac{d}{ad- bc} & \frac{-b}{ad- bc}\\\frac{-c}{ad-  
bc}& \frac{a}{ad- bc}\end{pmatrix}), the inverse matrix of (\begin{pmatrix}a & b\c & d\end{pmatrix}).  
Gives the inverse of the function.  
Invert(sin(x)) yields asin(x).  
No account is taken of domain or range, for example for f(x) = x2 or f(x) = sin(x).  
The command works faster for functions that only contain one x.  
To make your construction more efficient you may want to rearrange your functions and use eg NInvert((x+1)^2-1) rather than NInvert(x^2+2x).  
See also NInvert Command, Eigenvalues Command, Eigenvectors Command,  
SVD Command, Transpose Command, JordanDiagonalization Command

### InverseLaplace

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/InverseLaplace/>

**语法：**

```
InverseLaplace( <Function> )
InverseLaplace( <Function>, <Variable> )
InverseLaplace( <Function>, <Original Variable>, <Transformed Variable> )
```

**说明 / 示例：**

CAS Syntax  
Returns the inverse Laplace transform of the given function.  
InverseLaplace(1/(1+t^2)) returns (\mathbf{ sin(t)} ).  
Returns the inverse Laplace transform of the function, with respect to the given variable.  
InverseLaplace( exp(- a*b),a) returns (\mathbf{Dirac(a-b)})  
InverseLaplace( exp(- a*b),b) returns (\mathbf{Dirac(b-a)})  
Returns the inverse Laplace transform of the given function with respect to the original variable, expressed in terms of the transformed variable.  
InverseLaplace(1/(s^2+1),s,x) returns (\mathbf{ sin(x)})  
See also Laplace command.

### IsVertexForm

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/IsVertexForm/>

**语法：**

```
IsVertexForm(<function>)
```

**说明 / 示例：**

Checks if a function is written in vertex form.  
IsVertexForm((x+2/3)^2-(2/3)^2) yields true  
IsVertexForm(2*(3 x-2)^(2)+1) yields false

### Iteration

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Iteration/>

**语法：**

```
Iteration( <Function>, <Start Value>, <Number of Iterations> )
Iteration( <Expression>, <Variable Name>, …, <Start Values>, <Number of Iterations> )
```

**说明 / 示例：**

Iterates the function n times (n = number of iterations) using the given start value.  
After defining f(x) = x^2 the command Iteration(f, 3, 2) gives you the result (32)2 = 81.  
Repeated addition: To obtain the repeated addition of 7 to the number 3, define g(x) = x + 7, then  
Iteration(g, 3, 4) yields (((3+7) +7) +7) +7 = 31.  
Iterates the expression n times (n = number of iterations) using the given start value. The result is then the  
last element of the output of IterationList Command, with the same parameters.  
Iteration(a^2+1,a,{(1+ί)/(sqrt(2))},5) will do a repeated iteration on a complex number  
See IterationList Command for further details.

### IterationList

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/IterationList/>

**语法：**

```
IterationList( <Function>, <Start Value>, <Number of Iterations> )
IterationList( <Expression>, <Variable Name>, …, <Start Values>, <Number of Iterations> )
```

**说明 / 示例：**

Gives you a list of length n+1 (n = number of iterations) whose elements are iterations of the function starting  
with the start value.  
After defining f(x) = x^2 the command IterationList(f, 3, 2) gives you the list {3, 9, 81}.  
You can also use this command to define a sequence where ak+1 depends on ak and k. If the input function f  
is a function of two variables and start value is a list of two numbers {s, as}, then the output list consists of  
numbers as,as+1,….,as+n where for k>s we have ak+1=f(k, ak).  
Define f(k,a)=(k+1)*a, which corresponds to the recursive definition of factorial. The command  
IterationList(f, {3, 6}, 4) gives you the list {6, 24, 120, 720, 5040}.  
Gives you a list of length n+1 (n = number of iterations) whose elements are iterations of the expression starting  
with the given start value. In each iteration the variables in the expression are substituted by last elements of the  
list. There should be at least as many start values as there are variables, otherwise the result is undefined.  
Let A, B be points. The command IterationList(Midpoint(A, C), C, {B}, 3) internally computes values C0 =  
B,   C1 = Midpoint(A, C0),   C2 = Midpoint(A, C1),   C3 = Midpoint(A,  
C2) and yields {C0, C1, C2, C3}. Hence for A = (0,0) and B = (8,0) the result will be  
{(8,0), (4,0), (2,0), (1,0)}.  
Let f0, f1 be numbers. IterationList(a + b, a, b, {f_0, f_1}, 5) fills the first 2 values of the resulting  
list from the start values. Afterwards the values are computed as f2 = f0 + f1,   f3 = f1

- f2,   f4 = f2 + f3,   f5 = f3 + f4. Hence for f0 = f1 = 1 the result    
  will be {1, 1, 2, 3, 5, 8}.    
  Only the first syntax is supported in the CAS currently    
  See also Iteration Command.

### Laplace

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Laplace/>

**语法：**

```
Laplace( <Function> )
Laplace( <Function>, <Variable> )
Laplace( <Function>, <Original Variable>, <Transformed Variable> )
```

**说明 / 示例：**

CAS Syntax  
Returns the Laplace transform of the given function.  
Laplace(sin(t)) returns (\mathbf{\frac{1}{s^{2} + 1}} )  
Returns the Laplace transform of the function, with respect to the given variable.  
Laplace(sin(a*t),t) returns (\mathbf{\frac{a}{a^{2} + t^{2}}})  
Laplace(sin(a*t),a) returns (\mathbf{\frac{t}{a^{2} + t^{2}}})  
Returns the Laplace transform of the given function with respect to the original variable, expressed in terms of the transformed variable.  
Laplace(sin(a*t),t,s) returns (\mathbf{\frac{a}{a^{2} + s^{2}}})  
Laplace(sin(a*t),a,b) returns (\mathbf{\frac{t}{b^{2} + t^{2}}})  
See also InverseLaplace command.

### LeftSum

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/LeftSum/>

**语法：**

```
LeftSum( <Function>, <Start x-Value>, <End x-Value>, <Number of Rectangles> )
```

**说明 / 示例：**

Calculates the left sum of the function in the interval using n rectangles.  
LeftSum(x^2 + 1, 0, 2, 4) yields a = 3.75  
This command draws the rectangles of the left sum as well.  
This command is designed as a visual aid so won’t give accurate answers if the number of rectangles is too large.  
See also the commands: RectangleSum,  
TrapezoidalSum, LowerSum and  
UpperSum.

### Length

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Length/>

**语法：**

```
Length( <Object> )
Length( <Vector> ) yields the length of the vector.
Length( <Point> ) yields the length of the position vector of the given point.
Length( <List> ) yields the length of the list, which is the number of elements in the list.
Length( <Text> ) yields the number of characters in the text.
Length( <Locus> ) returns the number of points that the given locus is made up of. Use
Length( <Arc> ) returns the arc length (i.e. just the length of the curved section) of an arc or sector.
Length( <Function>, <Start x-Value>, <End x-Value> )
Length( <Function>, <Start Point>, <End Point> )
Length( <Curve>, <Start t-Value>, <End t-Value> )
Length( <Curve>, <Start Point>, <End Point> )
Length( <Function>, <Variable>, <Start x-Value>, <End x-Value> )
```

**说明 / 示例：**

Yields the length of the object.  
Perimeter(Locus) to get the length of the locus itself. For details see the article about  
First Command.  
Yields the length of the function graph in the given interval.  
Length(2x, 0, 1) returns 2.236067977, about (\sqrt{5}).  
Yields the length of the function graph between the two points.  
If the given points do not lie on the function graph, their x‐coordinates are used to determine the interval.  
Yields the length of the curve between the two values of the parameter.  
Yields the length of the curve between the two points that lie on the curve.  
CAS Syntax  
Calculates the length of a function graph between the two points.  
Length(2 x, 0, 1) yields (\sqrt{5}).  
Calculates the length of a function graph from Start x-value to End x-value.  
Length(2 a, a, 0, 1) yields (\sqrt{5}).  
See also  
Distance or Length tool.

### Limit

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Limit/>

**语法：**

```
Limit( <Function>, <Value> )
Limit( <Expression>, <Value> )
Limit( <Expression>, <Variable>, <Value> )
```

**说明 / 示例：**

Computes the limit of the function for the given value of the main  
function variable. (This may also yield infinity.)  
Limit((x^2 + x) / x^2, +∞) yields 1.  
Not all limits can be calculated by GeoGebra, so undefined will be returned in those cases (as well as when the  
correct result is undefined).  
CAS Syntax  
Computes the limit of the expression for the given value of the main function variable.  
Limit(a sin(x) / x, 0) yields a.  
Computes the limit of the expression for the given value of the given function variable.  
Limit(a sin(v) / v, v, 0) yields a.  
Not all limits can be calculated by GeoGebra, so ? will be returned in those cases (as well as when the correct  
result is undefined).  
If you want the limit of a piecewise-defined function you need to use  
LimitAbove or LimitBelow, for example  
LimitAbove(If(x>1, x^2, -2x), 1)  
See also Asymptote Command, LimitAbove Command and  
LimitBelow Command.

### LimitAbove

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/LimitAbove/>

**语法：**

```
LimitAbove( <Function>, <Value> )
LimitAbove( <Expression>, <Value> )
LimitAbove( <Expression>, <Variable>, <Value> )
```

**说明 / 示例：**

Computes the right one-sided limit of the function  
for the given value of the main function variable.  
LimitAbove(1 / x, 0) yields (\infty) .  
Not all limits can be calculated by GeoGebra, so undefined will be returned in those cases (as well as when the  
correct result is undefined).  
CAS Syntax  
Computes the right one-sided limit of the function for the given value of the main function variable.  
LimitAbove(1 / x, 0) yields (\infty) .  
Computes the right one-sided limit of the multivariate function for the given value of the given function variable.  
LimitAbove(1 / a, a, 0) yields (\infty) .  
Not all limits can be calculated by GeoGebra, so ? will be returned in those cases (as well as when the correct result  
is undefined).  
See also Limit Command and LimitBelow Command.

### LimitBelow

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/LimitBelow/>

**语法：**

```
LimitBelow( <Function>, <Value> )
LimitBelow( <Expression>, <Value> )
LimitBelow( <Expression>, <Variable>, <Value> )
```

**说明 / 示例：**

Computes the left one-sided limit of the function  
for the given value of the main function variable.  
LimitBelow(1 / x, 0) yields (-\infty) .  
Not all limits can be calculated by GeoGebra, so undefined will be returned in those cases (as well as when the  
correct result is undefined).  
CAS Syntax  
Computes the left one-sided limit of the function for the given value of the main function variable.  
LimitBelow(1 / x, 0) yields (-\infty) .  
Computes the left one-sided limit of the multivariate function for the given value of the given function variable.  
LimitBelow(1 / a, a, 0) yields (-\infty) .  
Not all limits can be calculated by GeoGebra, so ? will be returned in those cases (as well as when the correct result  
is undefined).  
See also Limit Command and LimitAbove Command.

### LowerSum

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/LowerSum/>

**语法：**

```
LowerSum( <Function>, <Start x-Value>, <End x-Value>, <Number of Rectangles> )
```

**说明 / 示例：**

Calculates the lower sum of the given function on the interval [Start x-Value, End x-Value], using n rectangles.  
LowerSum(x^2, -2, 4, 6) yields 15.  
This command draws the rectangles for the lower sum as well.  
This command is designed as a visual aid so won’t give accurate answers if the number of rectangles is too large.  
See also the commands: UpperSum, LeftSum,  
RectangleSum, and TrapezoidalSum.

### Max

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Max/>

**语法：**

```
Max( <List> )
Max( <Interval> )
Max( <Number>, <Number> )
Max( <Function>, <Start x-Value>, <End x-Value> )
Max(<List of Data>, <List of Frequencies> )
```

**说明 / 示例：**

Returns the maximum of the numbers within the list.  
Max({-2, 12, -23, 17, 15}) yields 17.  
If the input consists of non-numeric objects, then this command considers the numbers associated with those objects. If  
you have a list of segments for example, the command Max( <List> ) will yield the maximum segment length.  
Returns the upper bound of the interval.  
Max(2 < x < 3) yields 3.  
Open and closed intervals are treated the same.  
Returns the maximum of the two given numbers.  
Max(12, 15) yields 15.  
Calculates (numerically) the local maximum point of the function in the given interval. The function should be  
continuous, defined over its natural domain (i.e. no domain restrictions are applied), and have only one local maximum point in the interval (and no local minimum).  
Max(exp(x)x^2,-3,-1) creates the point (-2, 0.54134).  
For polynomials you should use the Extremum Command.  
Returns the maximum of the list of data with corresponding frequencies.  
Max({1, 2, 3, 4, 5}, {5, 3, 4, 2, 0}) yields 4, the highest number of the list whose frequency is greater than 0.  
If you want the maximum of two functions f(x) and g(x) then you can define  
(f(x) + g(x) + abs(f(x) - g(x)))/2  
See also Extremum Command, Min Command and  
Function Inspector Tool.  
CAS Syntax  
Unlike in the Algebra View, this syntax will give the maximum over the interval, including endpoints. The function should be  
continuous, defined over its natural domain (i.e. no domain restrictions are applied), and have only one local maximum point in the interval (and no local minimum).  
Max(x^2,-1,2) yields the point (2,4)  
Max(-x^2,-1,2) yields the point (0,0)

### Min

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Min/>

**语法：**

```
Min( <List> )
Min( <Interval> )
Min( <Number>, <Number> )
Min( <Function>, <Start x-Value>, <End x-Value> )
Min( <List of Data>, <List of Frequencies> )
```

**说明 / 示例：**

Returns the minimum of the numbers within the list.  
Min({-2, 12, -23, 17, 15}) yields -23.  
If the input consists of non-numeric objects, then this command considers the numbers associated with those objects. If  
you have a list of segments for example, the command Min( <List> ) will yield the minimum segment length.  
Returns the lower bound of the interval.  
Min(2 < x < 3) yields 2 .  
Open and closed intervals are not distinguished.  
Returns the minimum of the two given numbers.  
Min(12, 15) yields 12.  
Calculates (numerically) the local minimum point for function in the given interval. The function should be  
continuous, defined over its natural domain (i.e. no domain restrictions are applied), and have only one local minimum point in the interval (and no local maximum).  
Min(exp(x) x^3,-4,-2) creates the point (-3, -1.34425) .  
For polynomials you should use the Extremum Command.  
Returns the minimum of the list of data with corresponding frequencies.  
Min({1, 2, 3, 4, 5}, {0, 3, 4, 2, 3}) yields 2, the lowest number of the first list whose frequency is greater  
than 0.  
If you want the minimum of two functions f(x) and g(x) then you can define  
(f(x) + g(x) - abs(f(x) - g(x)))/2  
See also Max Command, Extremum Command and  
Function Inspector Tool.  
CAS Syntax  
Unlike in the Algebra View, this syntax will give the minimum over the interval, including endpoints. The function should be  
continuous, defined over its natural domain (i.e. no domain restrictions are applied), and have only one local minimum point in the interval (and no local maximum).  
Min(x^2,-1,2) yields the point (0,0)  
Min(-x^2,-1,2) yields the point (2,-4)

### NDerivative

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/NDerivative/>

**语法：**

```
NDerivative( <Function> )
NDerivative( <Function>, <Order n> )
```

**说明 / 示例：**

Plots the 1st derivative of the given function, calculated numerically.  
NDerivative(x^4+2x^3-2x+1) plots in Graphics View the graph of the function f(x) = 4x³ + 6x² - 2, which is the  
first derivative of the given function. However, the equation of the plotted function is not shown in Algebra View.  
Plots the nth derivative of the given function, calculated numerically.

### NIntegral

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/NIntegral/>

**语法：**

```
NIntegral( <Function> )
NIntegral( <Function>, <Start x-Value>, <End x-Value> )
NIntegral( <Function>, <Start x-Value>, <Start y-Value>, <End x-Value> )
NIntegral( <Function>, <Variable>, <Start Value>, <End Value> )
```

**说明 / 示例：**

Plots the graph of the indefinite integral (y=F(x)+c) of the given function, with constant of integration c = 0. The equation of the primitive is not shown in Algebra View, because it is computed numerically.  
Computes (numerically) and plots the definite integral (\int_a^bf(x)\mathrm{d}x) of the given function f, from a  
(Start x-Value) to b (End x-Value).  
NIntegral(ℯ^(-x^2), 0, 1) yields 0.75.  
Computes (numerically) the indefinite integral of the given function, and plots the graph of that function through  
(Start x-Value, Start y-Value), with end point at (End x-Value).  
NIntegral(sin(x)/x, π, 1, 2π) plots the graph of the indefinite integral (y=F(x)+c) of the given function in  
the interval [π, 2π]. The value of (c) is defined by the initial condition (start x-Value, start y-Value)=(π, 1).  
Hint: In the CAS View the following syntax can also be used:  
Computes (numerically) the definite integral (\int_a^bf(t)\mathrm{d}x) of the given function f, from a  
(Start value) to b (End value), with respect to the given variable.  
NIntegral(ℯ^(-a^2), a, 0, 1) yields 0.75.

### NInvert

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/NInvert/>

**语法：**

```
NInvert( <Function> )
```

**说明 / 示例：**

Gives the inverse of the function without showing the inverted formula.  
If you want to get the formula, use the Invert Command instead.  
NInvert(sin(x)) yields a function f such that sin(f(x))=x for -1 < x < 1.  
No account is taken of domain or range, for example for f(x) = x2 or f(x) =  
sin(x).  
The command works faster for functions that only contain one x.  
To make your construction more efficient you may want to rearrange your functions and use eg NInvert((x+1)^2-1) rather than NInvert(x^2+2x).

### NSolveODE

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/NSolveODE/>

**语法：**

```
NSolveODE( <List of Derivatives>, <Initial x-coordinate>, <List of Initial y-coordinates>, <Final x-coordinate> )
```

**说明 / 示例：**

Solves (numerically) the system of differential equations  
f'(t, f, g, h) = g  
g'(t, f, g, h) = h  
h'(t, f, g, h) = -t h + 3t g + 2f + t  
NSolveODE({f', g', h'}, 0, {1,2,-2}, 10)  
NSolveODE({f', g', h'}, 0, {1,2,-2}, -5) (solves the system backwards in time).  
x1'(t, x1, x2, x3, x4) = x2  
x2'(t, x1, x2, x3, x4) = x3  
x3'(t, x1, x2, x3, x4) = x4  
x4'(t, x1, x2, x3, x4) = -8x1 + sin(t) x2 - 3x3 + t^2  
x10 = -0.4  
x20 = -0.3  
x30 = 1.8  
x40 = -1.5  
NSolveODE({x1', x2', x3', x4'}, 0, {x10, x20, x30, x40}, 20)  
Pendulum:  
g = 9.8  
l = 2  
a = 5 (starting location)  
b = 3 (starting force)  
y1'(t, y1, y2) = y2  
y2'(t, y1, y2) = (-g) / l sin(y1)  
NSolveODE({y1', y2'}, 0, {a, b}, 20)  
len = Length(numericalIntegral1)  
c = Slider(0, 1, 1 / len, 1, 100, false, true, true, false)  
x1 = l sin(y(Point(numericalIntegral1, c)))  
y1 = -l cos(y(Point(numericalIntegral1, c)))  
A = (x1, y1)  
Segment((0, 0), A)  
StartAnimation()  
See also SlopeField command, SolveODE command.

### Normalize

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Normalize/>

**语法：**

```
Normalize( <List of Numbers> )
Normalize( <List of Points> )
```

**说明 / 示例：**

This command differs among variants of English:  
Normalize (US)  
Normalise (UK + Aus)  
Returns a list containing the normalized form of the given numbers.  
Normalize({1, 2, 3, 4, 5}) returns {0, 0.25, 0.5, 0.75, 1}.  
Returns a list containing the normalized form of the given points.  
Normalize({(1,5), (2,4), (3,3), (4,2), (5,1)}) returns {(0,1), (0.25,0.75), (0.5,0.5), (0.75,0.25), (1,0)}.  
If you are doing calculations using big or small numbers (eg using FitGrowth) then  
normalizing them might avoid rounding/overflow errors  
This command is not applicable to 3D points.  
The operation of normalization maps a value x to the interval [0, 1] using the linear function (x \rightarrow \frac{x-Min(list)}{Max(list)-Min(list)}).

### Numerator

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Numerator/>

**语法：**

```
Numerator( <Function> )
Numerator( <Number> )
Numerator( <Expression> )
```

**说明 / 示例：**

Returns the numerator of the function.  
Numerator((3x² + 1) / (2x - 1)) yields f(x) = 3x² + 1.  
For a rational number returns its (simplified) numerator. It uses a numerical method, which limits this command to numbers with  
small denominator. For irrational input the numerator of its continued fraction  
is returned.  
Numerator(5 / 3) yields 5.  
Numerator(10 / 6) yields 5.  
Numerator(15 / 3) yields 5.  
See also Denominator Command and FractionText  
Command.  
CAS Syntax  
Returns the numerator of a rational number or expression.  
Numerator(2/3 + 1/15) yields 11.  
If variables a, b and c haven’t been previously defined in GeoGebra, then Numerator(a/b) yields a and  
Numerator(Simplify(a + b/c)) yields a c + b

### OsculatingCircle

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/OsculatingCircle/>

**语法：**

```
OsculatingCircle( <Point>, <Function> )
OsculatingCircle( <Point>, <Curve> )
OsculatingCircle( <Point>, <Object> )
```

**说明 / 示例：**

Yields the osculating circle of the function in the given point.  
OsculatingCircle((0, 0), x^2) yields x² + y² - y = 0.  
Yields the osculating circle of the curve in the given point.  
OsculatingCircle((1, 0), Curve(cos(t), sin(2t), t, 0, 2π)) yields x² + y² + 6x = 7.  
Yields the osculating circle of the object (function, curve, conic) in the given point.  
OsculatingCircle((0, 0), x^2) yields x² + y² - y = 0  
OsculatingCircle((1, 0), Curve(cos(t), sin(2t), t, 0, 2π)) yields x² + y² + 6x = 7  
OsculatingCircle((-1, 0), Conic({1, 1, 1, 2, 2, 3})) yields x² + y² + 2x + 1y = -1  
This command is for 2D objects only. For 3D, you can make a custom tool for example  
<https://www.geogebra.org/m/tan7dxjt>

### ParametricDerivative

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/ParametricDerivative/>

**语法：**

```
ParametricDerivative( <Curve> )
```

**说明 / 示例：**

Returns a new parametric curve given by ( \left( x(t), \frac{y'(t)}{ x'(t)} \right) ).  
ParametricDerivative(Curve(2t, t², t, 0, 10)) returns the parametric curve (x(t) = 2t, y(t) = t). The curve  
given as argument to the command is the function f(x) = ( \frac{x²}{4}), and the result is the derivative of  
that function: f'(x) = ( \frac{x}{2}).

### ParseToFunction

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/ParseToFunction/>

**语法：**

```
ParseToFunction( <Text> )
ParseToFunction( <Function>, <Text> )
ParseToFunction( <Text>, <List of variables> )
```

**说明 / 示例：**

Parses the text containing the function definition and creates the corresponding function.  
ParseToFunction("x^2") creates the function f(x) = x2.  
ParseToFunction("t+2/t") creates the function f(t) = t + 2/t.  
Parses the string and stores the result to a function f, which must be defined and  
free before the command is used.  
Define f(x) = 3x² + 2 and text1 = "f(x) = 3x + 1". ParseToFunction(f, text1) returns f(x) = 3x +1.  
Parses the text containing the function definition and creates the corresponding function of the  
variables defined in the list.  
ParseToFunction("2u+3v",{"u", "v"}) creates the function a(u,v) = 2u + 3v.  
See also ParseToNumber command.

### PartialFractions

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/PartialFractions/>

**语法：**

```
PartialFractions( <Function> )
PartialFractions( <Function>, <Variable> )
```

**说明 / 示例：**

Yields, if possible, the partial fraction of the given function for the  
main function variable. The graph of the function is plotted in the Graphics View.  
PartialFractions(x^2 / (x^2 - 2x + 1)) yields 1 + (\frac{1}{(x - 1)²}) + (\frac{2}{x-1}).  
Hint: In the CAS View you can also use the following syntax:  
Yields, if possible, the partial fraction of the given function for the given function variable.  
PartialFractions(a^2 / (a^2 - 2a + 1), a) yields 1 + (\frac{1}{(a - 1)²}) + (\frac{2}{(a-1)}).

### PathParameter

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/PathParameter/>

**语法：**

```
PathParameter( <Point On Path> )
```

**说明 / 示例：**

Returns the parameter (i.e. a number ranging from 0 to 1) of the point that belongs to a  
path.  
Let f(x) = x² + x - 1 and A is a point attached to this function with coordinates (1,1) (you can create such point using the point on object tool or A=Point(f), SetCoords(A,1,1) commands). Then PathParameter(A) yields a  
= 0.47.  
In the following table (f(x)=\frac{x}{1+|x|}) is a function used to map all real numbers into interval (-1,1) and  
(\phi(X,A,B)=\frac{\overrightarrow{AX}\cdot\overrightarrow{AB}}{|AB|^2}) is a linear map from line AB to reals  
which sends A to 0 and B to 1.  
Line AB  
(\frac{f(\phi(X,A,B))+1}2)  
Ray AB  
(f(\phi(X,A,B)))  
Segment AB  
(\phi(X,A,B))  
Circle with center C and radius r  
Point (X=C+(r\cdot \cos(\alpha),r\cdot \sin(\alpha))), where (\alpha\in ]-\pi,\pi]) has path parameter (\frac{\alpha+\pi}{2\pi})  
Ellipse with center C and semiaxes (\vec{a}), (\vec{b})  
Point (X=C+ \vec{a} \cdot \cos(\alpha) + \vec{b} \cdot \sin(\alpha) ) , where (\alpha\in ]-\pi,\pi]) has path parameter  
(\frac{\alpha+\pi}{2\pi})  
Hyperbola  
Point (X = C \pm \vec{a} · \cosh(t) + \vec{b} · \sinh(t)) has path parameter ( \frac{f(t)+1}{4})  
or (\frac{f(t)+3}{4})  
Parabola with vertex V and direction of axis (\vec{v}).  
Point (V+\frac{1}{2}p\cdot t^2\cdot  
\vec{v}+p\cdot t \cdot \vec{v}^{\perp}) has path parameter (\frac{f(t)+1}2).  
Polyline A1…An  
If X lies on AkAk+1, path parameter of X is (\frac{k-1+\phi(X,A,B)}{n-1})  
Polygon A1…An  
If X lies on AkAk+1 (using An+1=A1), path parameter of X is  
(\frac{k-1+\phi(X,A,B)}{n})  
List of paths L={p1,…,pn}  
If X lies on pk and path parameter of X w.r.t. pk is t, path parameter of X  
w.r.t.L is (\frac{k-1+t}{n})  
List of points L={A1,…,An}  
Path parameter of Ak is (\frac{k-1}{n}). Point[L,t] returns  
(A\_{\lfloor tn\rfloor+1}).  
Locus  
Implicit polynomial  
No formula available.

### PlotSolve

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/PlotSolve/>

**语法：**

```
PlotSolve( <Equation in x> )
```

**说明 / 示例：**

Solves a given equation for the main variable and returns a list of all solutions and the graphical output in the  
Graphics View.  
PlotSolve(x^2 = 4x) yields {(0, 0), (4, 0)} and displays the points (0, 0) and (4, 0) in the Graphics View.

### Polynomial

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Polynomial/>

**语法：**

```
Polynomial( <Function> )
Polynomial( <List of Points> )
Polynomial( <Function>, <Variable> )
```

**说明 / 示例：**

Expands the expression of a polynomial function and simplifies the result.  
Polynomial((x - 3)^2) yields x2 - 6x + 9.  
Polynomial(y^2+(x+y)^2) yields x2 + 2xy + 2y2.  
Polynomial(2x³ - 1 x² + 0x + 4) yields 2x³ - x² + 4.  
Creates the interpolation polynomial of degree n-1 through the given n points.  
Polynomial({(1, 1), (2, 3), (3, 6)}) yields 0.5 x2 + 0.5 x.  
CAS Syntax  
Expands the function and writes it as a polynomial in x (grouping the coefficients).  
Polynomial((x - 3)^2 + (a + x)^2) yields 2 x2 + (2a - 6) x + a2 + 9.  
Expands the function and writes it as a polynomial in the variable (grouping the coefficients).  
Polynomial((x - 3)^2 + (a + x)^2, a) yields a2 + 2 x a + 2 x2 - 6 x + 9.

### Product

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Product/>

**语法：**

```
Product( <List of Raw Data> )
Product( <List of Numbers>, <Number of Elements> )
Product( <List of Numbers>, <List of Frequencies> )
Product( <Expression>, <Variable>, <Start Value>, <End Value> )
Product( <List of Expressions> )
```

**说明 / 示例：**

Calculates the product of all numbers in the list.  
Product({2, 5, 8}) yields 80.  
Calculates the product of the first n elements in the list.  
Product({1, 2, 3, 4}, 3) yields 6.  
Calculates the product of all elements in the list of numbers raised to the value given in the list of frequencies  
for each one of them.  
Product({20, 40, 50, 60}, {4, 3, 2, 1}) yields 1536000000000000  
Product({sqrt(2), cbrt(3), sqrt(5), cbrt(-7)}, {4, 3, 2, 3}) yields -420  
The two lists must have the same length.  
Calculates the product of the expressions that are obtained by replacing the given variable with every integer from the given  
start to the given end values.  
Product(k, k, 1, 7) yields 5040  
Product(x + k, k, 2, 3) yields f(x)=(x + 2)(x + 3).  
CAS Syntax  
Calculates the product of all elements in the list.  
Product({1, 2, x}) yields 2x.  
Calculates the product of the expressions that are obtained by replacing the given variable with every integer from the given  
start to the given end values.  
Product(x + 1, x, 2, 3) yields 12.

### RandomPolynomial

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/RandomPolynomial/>

**语法：**

```
RandomPolynomial( <Degree> , <Minimum for Coefficients>, <Maximum for Coefficients> )
RandomPolynomial( <Variable>, <Degree> , <Minimum for Coefficients>, <Maximum for Coefficients> )
```

**说明 / 示例：**

Returns a randomly generated polynomial in x of degree d, whose (integer) coefficients are in the range from  
minimum to maximum, both included.  
RandomPolynomial(0, 1, 2) yields either 1 or 2.  
RandomPolynomial(2, 1, 2) yields a random polynomial with a degree of two and only 1 and 2 as coefficients,  
for example 2x2 + x + 1.  
CAS Syntax  
The following command is only available in the  
CAS View.  
Returns a randomly generated polynomial in Variable of degree d, whose (integer) coefficients are in the range  
from minimum to maximum, both included.  
RandomPolynomial(a, 0, 1, 2) yields either 1 or 2.  
RandomPolynomial(a, 2, 1, 2) yields a random polynomial with a degree of two and only 1 and 2 as  
coefficients, for example 2a2 + a + 1.  
In both cases if minimum or maximum are not integers, round(minimum) and round(maximum) are used instead.

### RectangleSum

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/RectangleSum/>

**语法：**

```
RectangleSum( <Function>, <Start x-Value>, <End x-Value>, <Number of Rectangles>, <Position for rectangle start> )
```

**说明 / 示例：**

Calculates between the Start x-Value and the End x-Value the sum of rectangles with left height starting at a  
fraction d (0 ≤ d ≤ 1) of each interval, using n rectangles.  
When d = 0 it is equivalent to the LeftSum command, and when d = 1 it computes the  
right sum of the given function.  
This command draws the rectangles of the left sum as well.  
This command is designed as a visual aid so won’t give accurate answers if the number of rectangles is too large.  
See also the commands: UpperSum, LowerSum,  
LeftSum , TrapezoidalSum.

### RemovableDiscontinuity

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/RemovableDiscontinuity/>

**语法：**

```
RemovableDiscontinuity( <Function> )
```

**说明 / 示例：**

Computes the removable discontinuity at a point for broken rational functions (also for previews).  
RemovableDiscontinuity((3-x)/(2 x^(2)-6 x)) yields (3,-0.17).

### Root

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Root/>

**语法：**

```
Root( <Polynomial> )
Root( <Function>, <Initial x-Value> )
Root( <Function>, <Start x-Value>, <End x-Value> )
```

**说明 / 示例：**

Yields all roots of the polynomial as intersection points of the function graph and the x‐axis.  
Root(0.1*x^2 - 1.5*x + 5) yields A = (5, 0) and B = (10, 0).  
Yields one root of the function using the initial value a for a numerical iterative method.  
Root(0.1*x^2 - 1.5*x + 5, 6) yields A = (5, 0).  
Let a be the Start x-Value and b the End x-Value . This command yields one root of the function in the  
interval [a, b] using a numerical iterative method.  
Root(0.1x² - 1.5x + 5, 8, 13) yields A = (10, 0).  
CAS Syntax  
Yields all roots of the polynomial as a list.  
Root(x^3 - 3 \* x^2 - 4 \* x + 12) yields {x = -2, x = 2, x = 3}.  
In the CAS View, this  
command is only a special variant of Solve Command.

### RootList

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/RootList/>

**语法：**

```
RootList( <List> )
```

**说明 / 示例：**

Converts a given list of numbers {a1,a2,…,an} to a list of points {(a1,0),(a2,0),…,(an,0)}, which is  
also displayed in the  
Graphics View.  
Command RootList({3, 4, 5, 2, 1, 3}) returns the list of points list1={(3,0), (4,0), (5,0), (2,0), (1,0),  
(3,0)}

### Roots

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Roots/>

**语法：**

```
Roots( <Function>, <Start x-Value>, <End x-Value> )
```

**说明 / 示例：**

Calculates the roots for function in the given interval. The function must be continuous on that interval. Because  
this algorithm is numeric, it may not find all the roots in some cases.  
Roots(f, -2, 1) with the function f(x) = 3x³ + 3x² - x yields  
A = (-1.264, 0), B = (0, 0), C = (0.264, 0)  
See also Root command

### Simplify

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Simplify/>

**语法：**

```
Simplify( <Function> )
Simplify( <Text> )
```

**说明 / 示例：**

Simplifies the terms of the given function, if possible.  
Simplify(x + x + x) yields the function f(x) = 3x.  
Attempts to tidy up text expressions by removing repeated negatives etc.  
For a = b = c = -1 Simplify("f(x) = " + a + "x² + " + b + "x + " + c) yields the text f(x) = -x2 - x -  
1\.  
The FormulaText Command normally produces better results and is simpler.  
This command needs to load the Computer Algebra System, so can be slow on some computers. Try using the  
Polynomial Command instead.  
CAS Syntax  
Simplifies the terms of the given function, if possible. Undefined variables can be included in the terms.  
Simplify(3 \* x + 4 \* x + a \* x) yields a x + 7x.  
Assume(x<2,Simplify(sqrt(x-2sqrt(x-1)))) yields -sqrt(abs(x - 1)) + 1  
Assume(x>2,Simplify(sqrt(x-2sqrt(x-1)))) yields sqrt(x - 1) + 1  
See also Factor Command, Assume Command,  
PartialFractions Command, Expand Command,  
Polynomial Command.

### SlopeField

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/SlopeField/>

**语法：**

```
SlopeField( <f(x,y)> )
SlopeField( <f(x,y)>, <Number n> )
SlopeField( <f(x,y)>, <Number n>, <Length Multiplier a> )
SlopeField( <f(x,y)>, <Number n>, <Length Multiplier a>, <Min x>, <Min y>, <Max x>, <Max y> )
```

**说明 / 示例：**

Plots a slope field of the differential equation  
(\frac{dy}{dx}=f(x,y))  
SlopeField(x+y) plots the slope field of the differential equation (\frac{dy}{dx}=x+y).  
Plots a slope field of the differential equation (\frac{dy}{dx}=f(x,y)) on an n by n grid (if the  
Graphics  
View is square) or a smaller grid if not. Default is 40.  
Plots a slope field of the differential equation (\frac{dy}{dx}=f(x,y)). The Length Multiplier 0<a≤1 determines  
how long the segments are.  
Plots a slope field of the differential equation (\frac{dy}{dx}=f(x,y)) inside the specified rectangle (rather  
than filling the  
Graphics View)  
Use the following tools:  
Move Graphics View, Zoom In, Zoom Out and observe the effect.  
See also SolveODE, Locus,  
Integral

### SolveODE

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/SolveODE/>

**语法：**

```
SolveODE( <f'(x, y)> )
SolveODE( <f'(x, y)>, <Point on f> )
SolveODE( <f'(x, y)>, <Start x>, <Start y>, <End x>, <Step> )
SolveODE( <y'>, <x'>, <Start x>, <Start y>, <End t>, <Step> )
SolveODE( <b(x)>, <c(x)>, <f(x)>, <Start x>, <Start y>, <Start y'>, <End x>, <Step> )
SolveODE( <Equation> )
SolveODE( <Equation>, <Point(s) on f> )
SolveODE( <Equation>, <Point(s) on f>, <Point(s) on f'> )
SolveODE( <Equation>, <Dependent Variable>, <Independent Variable>, <Point(s) on f> )
SolveODE( <Equation>, <Dependent Variable>, <Independent Variable>, <Point(s) on f>, <Point(s) on f'> )
```

**说明 / 示例：**

Attempts to find the exact solution of the first order ordinary differential equation (ODE)  
(\frac{dy}{dx}(x)=f'(x, y(x))).  
SolveODE(2x / y) yields (\sqrt{2} \sqrt{-c\_{1}+x^{2}}), where (c\_{1}) is a constant.  
(c\_{1}) will be created as an auxiliary object with a corresponding slider.  
Attempts to find the exact solution of the first order ODE (\frac{dy}{dx}(x)=f'(x, y(x))) and returns the solution  
through the given point (Cauchy problem).  
SolveODE(y / x, (1, 2)) yields y = 2x.  
Solves first order ODE (\frac{dy}{dx}=f'(x, y)) numerically with given start point, end and step for x.  
SolveODE(-x*y, x(A), y(A), 5, 0.1) solves (\frac{dy}{dx}=-xy) using previously defined A as a starting  
point.  
Length(  ) allows you to find out how many points are in the computed locus.  
First( ,  ) allows you to extract the points as a list.  
To find the "reverse" solution, just enter a negative value for End x, for example  
SolveODE(-x*y, x(A), y(A), -5, 0.1)  
Solves first order ODE (\frac{dy}{dx}=\frac{f(x, y)}{g(x, y)}) with given start point, maximal value of an  
internal parameter t and step for t. This version of the command may work where the first one fails e.g. when the  
solution curve has vertical points.  
SolveODE(-x, y, x(A), y(A), 5, 0.1) solves (\frac{dy}{dx}=- \frac{x}{y} ) using previously defined A as  
a starting point.  
To find the "reverse" solution, just enter a negative value for End t, for example  
SolveODE(-x, y, x(A), y(A), -5, 0.1).  
Solves second order ODE (y'' + b(x) y' + c(x) y = f(x)).  
SolveODE(x^2, 2x, 2x^2 + x, x(A), y(A), 0, 5, 0.1) solves the second order ODE using previously defined A as a  
starting point.  
Always returns the result as locus. The algorithms are currently based on  
Runge-Kutta numeric methods.  
See also SlopeField command.  
CAS Syntax  
Attempts to find the exact solution of the first or second order ODE. For first and second derivative of y you can  
use y' and y'' respectively.  
SolveODE(y' = y / x) yields y = c1 x.  
Attempts to find the exact solution of the given first or second order ODE which goes through the given point or list of points.  
SolveODE(y' = y / x, (1, 2)) yields y = 2x.  
Attempts to find the exact solution of the given first or second order ODE and goes through the given point (or list of points) on f  
and f' goes through the given point (or list of points) on f' .  
SolveODE(y'' - 3y' + 2 = x, (2, 3), (1, 2)) yields ( y = \frac{-9 x^2 e^3 + 30 x e^3 - 32 {(e^3)}^2 + 138  
e^3 + 32 e^{3 x} }{54 e^3} ).  
Attempts to find the exact solution of the given first or second order ODE which goes through the given point (or list of points).  
SolveODE(v' = v / w, v, w, (1, 2)) yields v = 2w.  
Attempts to find the exact solution of the given first or second order ODE which goes through the given point (or list of points) on  
f and f' goes through the given point (or list of points) on f' .  
SolveODE(v' = v / w, v, w, (1, 2), (0, 2)) yields v = 2w.  
For compatibility with input bar, if the first parameter is just an expression without y' or y'', it is supposed to  
be right hand side of ODE with left hand side y'.

### Spline

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Spline/>

**语法：**

```
Spline( <List of Points> )
Spline( <List of Points>, <Order ≥ 3> )
Spline( <List of Points>, <Order ≥ 3>, <Weight Function> )
```

**说明 / 示例：**

Creates a cubic spline through all points.  
Creates a spline with given order through all points.  
Creates a spline with given order through all points. The weight function says what should be the difference of t  
values for point Pi and Pi+1 given their difference Pi+1 - Pi = (x, y). To get the spline  
you expect from "function" algorithm you should use abs(x)+0*y, to get the GeoGebra’s default spline you can use  
sqrt(x^2+y^2).  
The choice of default makes the result behave nicely when transformed, making sure that Rotate(Spline(list), a)  
gives the same as Spline(Rotate(list, a)).

### Sum

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Sum/>

**语法：**

```
Sum( <List> )
Sum( <List>, <Number of Elements> )
Sum( <List>, <List of Frequencies> )
Sum( <Expression>, <Variable>, <Start Value>, <End Value> )
```

**说明 / 示例：**

Calculates the sum of all the elements in the list.  
Sum({1, 2, 3}) yields the number a = 6.  
Sum({x^2, x^3}) yields f(x) = x2 + x3.  
Sum(Sequence(i, i, 1, 100)) yields the number a = 5050.  
Sum({(1, 2), (2, 3)}) yields the point A = (3, 5).  
Sum({"a", "b", "c"}) yields the text "abc".  
Calculates the sum of the first n elements in the list.  
Sum({1, 2, 3, 4, 5, 6}, 4) yields the number a = 10.  
Returns the sum of the given list of values, considering the related frequencies.  
Sum({1, 2, 3, 4, 5}, {3, 2, 4, 4, 1}) yields a = 40.  
This command works for numbers, points, vectors, text, and functions.  
Lists must contain objects of the same type.  
CAS Syntax  
The following command works only in the  
CAS View.  
Computes the sum (\sum\_{t=Start Value}^{End Value}f(t)). End value can also be infinity.  
Sum(n^2, n, 1, 3) yields 14.  
Sum(r^k, k, 0, n) yields (\frac{r^{n+1} }{r - 1} - \frac{1}{r - 1}).  
Sum((1/3)^n, n, 0, Infinity) yields (\frac{3}{2}).

### Tangent

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Tangent/>

**语法：**

```
Tangent( <Point>, <Conic> )
Tangent( <Point>, <Function> )
Tangent( <Point on Curve>, <Curve> )
Tangent( <x-Value>, <Function> )
Tangent( <Line>, <Conic> )
Tangent( <Circle>, <Circle> )
Tangent( <Point>, <Spline> )
Tangent( <Point>, <Implicit Curve> )
```

**说明 / 示例：**

Creates (all) tangents through the point to the conic section.  
Tangent((5, 4), 4x^2 - 5y^2 = 20) yields x - y = 1.  
Creates the tangent to the function at x = x(A).  
Tangent((1, 0), x^2) yields y = 2x - 1.  
x(A) is the x-coordinate of the given point A.  
Creates the tangent to the curve in the given point.  
Tangent((0, 1), Curve(cos(t), sin(t), t, 0, π)) yields y = 1.  
Creates the tangent to the function at x-Value.  
Tangent(1, x^2) yields y = 2x - 1.  
Creates (all) tangents to the conic section that are parallel to the given line.  
Tangent(y = 4, x^2 + y^2 = 4) yields y = 2 and y = -2.  
Creates the common tangents to the two Circles (up to 4).  
Tangent(x^2 + y^2 = 4, (x - 6)^2 + y^2 = 4) yields y = 2, y = -2, 1.49x + 1.67y = 4.47 and -1.49x + 1.67y =  
-4.47.  
Creates the tangent to the spline in the given point.  
Let A = (0, 1), B = (4, 4) and C = (0, 4). Tangent(A, Spline({A, B, C})) yields line a: y = 0.59x + 1.  
Creates the tangent to the implicit curve in the given point.  
Tangent((1,1), x^2+y^2=1) yields lines x=1 and y=1.  
See also Tangents tool.

### TaylorPolynomial

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/TaylorPolynomial/>

**语法：**

```
TaylorPolynomial( <Function>, <x-Value>, <Order Number> )
TaylorPolynomial( <Expression>, <x-Value>, <Order Number> )
TaylorPolynomial( <Expression>, <Variable>, <Variable Value>, <Order Number> )
```

**说明 / 示例：**

Creates the Taylor series expansion of the given function at the point x-Value up to the given order.  
TaylorPolynomial(x^2, 3, 1) gives 9 + 6 (x - 3), the Taylor series expansion of x2 at x = 3 up to order 1.  
CAS Syntax  
Creates the Taylor series expansion of the given expression at the point x-Value up to the given order.  
TaylorPolynomial(x^2, a, 1) gives a2 + 2a (x - a), the Taylor series expansion of x2 at x = a up to order  
1\.  
Creates the Taylor series expansion of the given expression with respect to the given variable at the point Variable  
Value up to the given order.  
TaylorPolynomial(x^3 sin(y), x, 3, 2) gives 27 sin(y) + 27 sin(y) (x - 3) + 9 sin(y) (x - 3)2, the Taylor  
series expansion with respect to x of x3 sin(y) at x = 3 up to order 2.  
TaylorPolynomial(x^3 sin(y), y, 3, 2) gives x3 sin(3) + x3 cos(3) (y - 3) - x3 (\frac{sin(3) }{2})  
(y - 3)2, the Taylor series expansion with respect to y of x3 sin(y) at y = 3 up to order 2.  
The order has got to be an integer greater or equal to zero.

### ToComplex

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/ToComplex/>

**语法：**

```
ToComplex( <Vector> )
```

**说明 / 示例：**

Transforms a vector or point to a complex number in algebraic form.  
ToComplex((3, 2)) yields 3 + 2ί.  
CAS Syntax  
Transforms a vector or point to a complex number in algebraic form.  
ToComplex((3, 2)) yields 3 + 2ί.  
The complex ί is obtained by pressing ALT + i.  
See also ToExponential Command, ToPoint Command and  
ToPolar Command.

### ToExponential

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/ToExponential/>

**语法：**

```
ToExponential( <Complex Number> )
```

**说明 / 示例：**

CAS Syntax  
Transforms a complex number into its exponential form.  
ToExponential(1 + ί) yields (\sqrt{2}e^{\frac{i\pi}{4}}).  
The complex ί is obtained by pressing ALT + i.  
See also ToPoint Command, ToComplex Command and  
ToPolar Command.

### ToPoint

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/ToPoint/>

**语法：**

```
ToPoint( <Complex Number> )
```

**说明 / 示例：**

Creates a point from the complex number.  
ToPoint(3 + 2ί) creates a point with coordinates (3, 2).  
The complex ί is obtained by pressing ALT + i.  
See also the following commands: ToComplex,  
ToExponential and ToPolar.

### ToPolar

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/ToPolar/>

**语法：**

```
ToPolar( <Vector> )
ToPolar( <Complex Number> )
```

**说明 / 示例：**

Transforms a vector into its polar coordinates.  
ToPolar({1, sqrt(3)}) yields (2; 60°) in the Algebra View and (2; (\frac{\pi}{3})) in the  
CAS View.  
Transforms a complex number into its polar coordinates.  
ToPolar(1 + sqrt(3) * ί) yields (2; 60°) in the Algebra View and (2; (\frac{\pi}{3})) in the  
CAS View.  
The complex ί is obtained by pressing ALT + i.  
See also ToComplex Command, ToExponential Command  
and ToPoint Command.

### TrapezoidalSum

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/TrapezoidalSum/>

**语法：**

```
TrapezoidalSum( <Function>, <Start x-Value>, <End x-Value>, <Number of Trapezoids> )
```

**说明 / 示例：**

This command differs among variants of English:  
TrapezoidalSum (US)  
TrapeziumSum (UK + Aus)  
Calculates the trapezoidal sum of the function in the interval [Start x-Value, End x-Value] using n trapezoids.  
TrapezoidalSum(x^2, -2, 3, 5) yields 12.5.  
This command draws the trapezoids of the trapezoidal sum as well.

- This command is designed as a visual aid so won’t give accurate answers if the number of rectangles is too large.
- See also the commands: LowerSum, LeftSum,    
  RectangleSum and UpperSum.

### TriangleCurve

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/TriangleCurve/>

**语法：**

```
TriangleCurve( <Point P>, <Point Q>, <Point R>, <Equation in A, B, C> )
```

**说明 / 示例：**

Creates implicit polynomial, whose equation in  
barycentric coordinates with respect to  
points P, Q, R is given by the fourth parameter; the barycentric coordinates are referred to as A, B, C.  
If P, Q, R are points, TriangleCurve(P, Q, R, (A - B)*(B - C)*(C - A) = 0) gives a cubic curve consisting of  
the medians of the triangle PQR.  
TriangleCurve(A, B, C, A*C = 1/8) creates a hyperbola such that tangent, through A or C, to this hyperbola  
splits triangle ABC in two parts of equal area.  
TriangleCurve(A, B, C, A² + B² + C² - 2B C - 2C A - 2A B = 0) creates the  
Steiner inellipse of the triangle ABC, and  
TriangleCurve(A, B, C, B C + C A + A B = 0) creates the Steiner  
circumellipse of the triangle ABC.  
The input points can be called A, B or C, but in this case you cannot use e.g. x(A) in the equation, because A  
is interpreted as the barycentric coordinate.

### TrigCombine

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/TrigCombine/>

**语法：**

```
TrigCombine( <Expression> )
TrigCombine( <Expression>, <Target Function> )
```

**说明 / 示例：**

Combines products of trigonometric terms into sums, or combines sums of trigonometric terms into an expression containing only a trigonometric function.  
TrigCombine(sin(x) cos(3x)) gives (\frac{1}{2} \sin \left( 4 x \right) - \frac{1}{2} \sin \left( 2 x \right))  
TrigCombine(sin(x) + cos(x)) gives (\sqrt{2} \cos \left( x - \frac{1}{4} \pi \right)).  
Combines the terms of a trigonometric expression into an equivalent expression, containing only the given target function.  
TrigCombine(sin(x) + cos(x), sin(x)) gives (\sqrt{2} \sin \left( x + \frac{1}{4} \pi \right)).  
In the CAS View undefined  
variables can be used as well.  
TrigCombine(sin(p) cos(3p)) gives (\frac{1}{2} \sin \left( 4 p \right) - \frac{1}{2} \sin \left( 2 p \right)).  
See also TrigExpand Command and TrigSimplify  
Command.

### TrigExpand

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/TrigExpand/>

**语法：**

```
TrigExpand( <Expression> )
TrigExpand( <Expression>, <Target Function> )
TrigExpand( <Expression>, <Target Function>, <Target Variable> )
TrigExpand( <Expression>, <Target Function>, <Target Variable>, <Target Variable> )
```

**说明 / 示例：**

Expands trigonometric functions of a sum of variables into trigonometric functions of a single variable, or expands products of trigonometric functions into linear expressions.  
TrigExpand(tan(x + y)) gives (\frac{\frac{\sin(x)}{\cos(x)}+\frac{\sin(y)}{\cos(y)}}  
{1-\frac{\sin(x)}{\cos(x)} \cdot \frac{\sin(y)}{\cos(y)}} ).  
TrigExpand(sin(x)sin(x/3)) gives (\frac{1}{2} ; \cos \left( 2 \cdot \frac{x}{3} \right) -  
\frac{1}{2} ; \cos \left( 4 \cdot \frac{x}{3} \right) ).  
Expands trigonometric functions of a sum of variables into expressions containing (when possible) the given target function of a single variable.  
TrigExpand(tan(x + y), tan(x)) gives (\frac{-\tan(x) - \tan(y)}{\tan(x) \tan(y) - 1}).  
CAS Syntax  
CAS syntaxes may show different results, depending on the selected output mode:  
TrigExpand(tan(x + y)) in Evaluate mode  
gives (\frac{\frac{\sin(x)}{\cos(x)}+\frac{\sin(y)}{\cos(y)}} {1-\frac{\sin(x)}{\cos(x)} \cdot  
\frac{\sin(y)}{\cos(y)}} ) in Numeric mode gives  
(\frac{\sin(x) \cos(y) + \sin(y) \cos(x)}{- \sin(x) \sin(y) +\cos(x) \cos(y) }) .  
The following commands are only available in the  
CAS View:  
Expands trigonometric expressions into expressions containing (when possible) only the given target function and variable.  
TrigExpand(sin(x), sin(x), x/2) gives (2\cos \left( \frac{x}{2} \right) \sin \left( \frac{x}{2} \right) )  
TrigExpand(sin(x)/(1+cos(x)), tan(x), x/2) gives (\tan \left( \frac{x}{2} \right)).  
Expands trigonometric expressions into expressions containing (when possible) only the given target function and variables.  
TrigExpand(csc(x) - cot(x) + csc(y) - cot(y), tan(x), x/2, y/2) gives (\tan \left( \frac{x}{2} \right) +\tan  
\left( \frac{y}{2} \right) ).  
See also TrigSimplify Command and TrigCombine  
Command.

### TrigSimplify

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/TrigSimplify/>

**语法：**

```
TrigSimplify( <Expression> )
```

**说明 / 示例：**

Simplifies the given trigonometric expression.  
TrigSimplify(1 - sin(x)^2) gives cos²(x).  
TrigSimplify(sin(x)^2 - cos(x)^2 + 1) gives 2 sin²(x).  
This command works only for variables "x", "y" and "z" in the Algebra View  
CAS Syntax  
Simplifies the given trigonometric expression.  
TrigSimplify(1 - sin(x)^2) gives cos²(x)  
TrigSimplify(sin(x)^2 - cos(x)^2 + 1) gives 2 sin²(x).  
This command works for all variables in the  
CAS View  
See also TrigExpand Command and TrigCombine Command.

### UpperSum

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/UpperSum/>

**语法：**

```
UpperSum( <Function>, <Start x-Value>, <End x-Value>, <Number of Rectangles> )
```

**说明 / 示例：**

Calculates the upper sum of the function on the interval [Start x-Value, End x-Value] using n rectangles.  
UpperSum(x^2, -2, 4, 6) yields 35.  
This command draws the rectangles of the upper sum as well.  
This command is designed as a visual aid so won’t give accurate answers if the number of rectangles is too large.  
See also the commands: LowerSum, LeftSum,  
RectangleSum, and TrapezoidalSum.

## 几何命令

> 共 64 个命令

### AffineRatio

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/AffineRatio/>

**语法：**

```
AffineRatio( <Point A>, <Point B>, <Point C> )
```

**说明 / 示例：**

Returns the affine ratio λ of three collinear points A, B and C, where C = A + λ * AB.  
AffineRatio((-1, 1), (1, 1), (4, 1)) yields 2.5

### Angle

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Angle/>

**语法：**

```
Angle( <Object> )
Angle( <Vector>, <Vector> )
Angle( <Line>, <Line> )
Angle( <Line>, <Plane> )
Angle( <Plane>, <Plane> )
Angle( <Point>, <Apex>, <Point> )
Angle( <Point>, <Apex>, <Angle> )
Angle( <Point>, <Point>, <Point>, <Direction> )
```

**说明 / 示例：**

Conic: Returns the angle of twist of a conic section’s major axis (see command Axes).  
Angle(x²/4+y²/9=1) yields 90° or 1.57 if the default angle unit is radians.  
It is not possible to change the Angle Unit to Radian in GeoGebra 5.0 Web and Tablet App Version.  
Vector: Returns the angle between the x‐axis and given vector.  
Angle(Vector((1, 1))) yields 45° or the corresponding value in radians.  
Point: Returns the angle between the x‐axis and the position vector of the given point.  
Angle((1, 1)) yields 45° or the corresponding value in radians.  
Number: Converts the number into an angle (result in [0,360°] or [0,2π] depending on the default angle unit).  
Angle(20) yields 65.92° when the default unit for angles is degrees.  
Polygon: Creates all angles of a polygon in mathematically positive orientation (counter clockwise).  
Angle(Polygon((4, 1), (2, 4), (1, 1))) yields 56.31°, 52.13° and 71.57° or the corresponding values in  
radians.  
If the polygon was created in counter clockwise orientation, you get the interior angles. If the polygon was created in  
clockwise orientation, you get the exterior angles.  
Returns the angle between two vectors (result in [0,360°] or [0,2π] depending on the default angle unit).  
Angle(Vector((1, 1)), Vector((2, 5))) yields 23.2° or the corresponding value in radians.  
Returns the angle between the direction vectors of two lines (result in [0,360°] or [0,2π] depending on the default  
angle unit).  
Angle(y = x + 2, y = 2x + 3) yields 18.43° or the corresponding value in radians.  
Angle(Line((-2, 0, 0), (0, 0, 2)), Line((2, 0, 0), (0, 0, 2))) yields 90° or the corresponding value in  
radians.  
and in CAS View :  
Angle(x + 2, 2x + 3) yields (acos \left( 3 \cdot \frac{\sqrt{10}}{10} \right)).  
Define f(x) := x + 2 and g(x) := 2x + 3 then command Angle(f(x), g(x)) yields (acos \left(3  
\cdot \frac{\sqrt{10}}{10} \right)).  
Returns the angle between the line and the plane.  
Angle(Line((1, 2, 3),(-2, -2, 0)), z = 0) yields 30.96° or the corresponding value in radians.  
Returns the angle between the two given planes.  
Angle(2x - y + z = 0, z = 0) yields 114.09° or the corresponding value in radians.  
Returns the angle defined by the given points (result in [0,360°] or [0,2π] depending on the default angle unit).  
Angle((1, 1), (1, 4), (4, 2)) yields 56.31° or the corresponding value in radians.  
Returns the angle of size α drawn from point with apex.  
Angle((0, 0), (3, 3), 30°) yields 30° and the point (1.9, -1.1).  
The point Rotate( <Point>, <Angle>, <Apex> ) is created as well.  
Returns the angle defined by the points and the given Direction, that may be a line or a plane (result in [0,360°]  
or [0,2π] depending on the default angle unit).  
Angle((1, -1, 0),(0, 0, 0),(-1, -1, 0), zAxis) yields 270° and  
Angle((-1, -1, 0),(0, 0, 0),(1, -1, 0), zAxis) yields 90° or the corresponding values in radians.  
Using a Direction allows to bypass the standard display of angles in 3D which can be set as just [0,180°] or  
[180°,360°], so that given three points A, B, C in 3D the commands Angle(A, B, C) and  
Angle(C, B, A) return their real measure instead of the one restricted to the set intervals.  
See also Angle and  
Angle  
with Given Size tools.

### AngleBisector

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/AngleBisector/>

**语法：**

```
AngleBisector( <Line>, <Line> )
AngleBisector( <Point>, <Point>, <Point> )
```

**说明 / 示例：**

Returns both angle bisectors of the lines.  
AngleBisector(x + y = 1, x - y = 2) yields a: x = 1.5 and b: y = -0.5.  
Returns the angle bisector of the angle defined by the three points.  
AngleBisector((1, 1), (4, 4), (7, 1)) yields a: x = 4.  
The second point is apex of this angle.  
See also  
Angle Bisector tool .

### Arc

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Arc/>

**语法：**

```
Arc( <Circle>, <Point M >, <Point N> )
Arc( <Ellipse>, <Point M>, <Point N> )
Arc( <Circle>, <Parameter Value>, <Parameter Value> )
Arc( <Ellipse>, <Parameter Value>, <Parameter Value> )
```

**说明 / 示例：**

Returns the directed arc (counterclockwise) of the given circle, with endpoints M and N.  
Returns the directed arc (counterclockwise) of the given ellipse, with endpoints M and N.  
Returns the circle arc of the given circle, whose endpoints are identified by the specified values of the parameter.  
Internally the following parametric forms are used:Circle: (r cos(t), r sin(t)) where r is the circle’s  
radius.  
Returns the circle arc of the given ellipse, whose endpoints are identified by the specified values of the parameter.  
Internally the following parametric forms are used:Ellipse: (a cos(t), b sin(t)) where a and b are the  
lengths of the semimajor and semiminor axes.  
See also CircumcircularArc command.

### Area

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Area/>

**语法：**

```
Area( <Point>, …, <Point> )
Area( <Conic> )
Area( <Polygon> )
```

**说明 / 示例：**

Calculates the area of the polygon defined by the given points.  
Area((0, 0), (3, 0), (3, 2), (0, 2)) yields 6.  
Calculates the area of a conic section (circle or ellipse).  
Area(x^2 + y^2 = 2) yields 6.28.  
Calculates the area of the polygon.  
for Polygons, the absolute value of the Algebraic Area is calculated (which gives unexpected answers for  
self-intersecting polygons)  
In order to calculate the area between two function graphs, you need to use the command  
IntegralBetween.  
See also the Area tool.

### AreCollinear

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/AreCollinear/>

**语法：**

```
AreCollinear( <Point>, <Point>, <Point> )
```

**说明 / 示例：**

Decides if the points are collinear.  
Normally this command computes the result numerically. This behavior can be changed by using the  
Prove command.  
AreCollinear((1, 2), (3, 4), (5, 6)) yields true since all the three points lying on the same line.  
See also AreConcurrent, AreConcyclic,  
AreCongruent, AreEqual,  
ArePerpendicular, AreParallel,  
IsTangent commands.

### AreConcurrent

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/AreConcurrent/>

**语法：**

```
AreConcurrent( <Line>, <Line>, <Line> )
```

**说明 / 示例：**

Decides if the lines are concurrent. If the lines are parallel, they considered to have a common point in infinity,  
thus this command returns true in this case.  
Normally this command computes the result numerically. This behavior can be changed by using the  
Prove command.  
AreConcurrent(Line((1, 2), (3, 4)), Line((1, 2), (3, 5)), Line((1, 2), (3, 6))) yields true since all three  
lines contain the point (1,2).  
See also AreCollinear, AreConcyclic,  
AreCongruent, AreEqual,  
ArePerpendicular, AreParallel,  
IsTangent commands.

### AreConcyclic

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/AreConcyclic/>

**语法：**

```
AreConcyclic( <Point>, <Point>, <Point>, <Point> )
```

**说明 / 示例：**

Decides if the points are concyclic.  
Normally this command computes the result numerically. This behavior can be changed by using the  
Prove command.  
AreConcyclic((1, 2), (3, 4), (1, 4), (3, 2)) yields true since the points are lying on the same circle.  
See also AreCollinear, AreConcurrent,  
AreCongruent, AreEqual,  
ArePerpendicular, AreParallel,  
IsTangent commands.

### AreCongruent

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/AreCongruent/>

**语法：**

```
AreCongruent( <Object>, <Object> )
```

**说明 / 示例：**

Decides if the objects are congruent.  
Normally this command computes the result numerically. This behavior can be changed by using the  
Prove command.  
AreCongruent(Circle((0, 0),1),x^2+y^2=1) and AreCongruent(Circle((1, 1),1),x^2+y^2=1) yield true since the  
two circles have the same radius.  
See also AreEqual, AreCollinear,  
AreConcyclic, AreConcurrent,  
ArePerpendicular, AreParallel,  
IsTangent commands.

### AreEqual

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/AreEqual/>

**语法：**

```
AreEqual( <Object>, <Object> )
```

**说明 / 示例：**

Decides if the objects are equal.  
Normally this command computes the result numerically. This behavior can be changed by using the  
Prove command.  
AreEqual(Circle((0, 0),1),x^2+y^2=1) yields true since the two circles have the same center and radius.  
AreEqual(Segment((1, 2), (3, 4)), Segment((3, 4), (1, 6))) is different from  
Segment((1, 2), (3, 4)) == Segment((3, 4), (1, 6)) as the latter compares just the lengths  
See also AreCollinear, AreConcyclic,  
AreConcurrent, AreCongruent,  
ArePerpendicular, AreParallel,  
IsTangent commands.

### AreParallel

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/AreParallel/>

**语法：**

```
AreParallel( <Line>, <Line> )
```

**说明 / 示例：**

Decides if the lines are parallel.  
Normally this command computes the result numerically. This behavior can be changed by using the  
Prove command.  
AreParallel(Line[(1, 2), (3, 4)), Line((5, 6),(7,8))) yields true since the given lines are parallel.  
See also AreCollinear, AreConcurrent,  
AreCongruent, AreConcyclic,  
AreEqual, ArePerpendicular,  
IsTangent commands.

### ArePerpendicular

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/ArePerpendicular/>

**语法：**

```
ArePerpendicular( <Line>, <Line> )
```

**说明 / 示例：**

Decides if the lines are perpendicular.  
Normally this command computes the result numerically. This behavior can be changed by using the  
Prove command.  
ArePerpendicular(Line((-1, 0), (0, -1)), Line((0, 0),(2,2))) yields true since the given lines are  
perpendicular.  
See also AreCollinear, AreConcurrent,  
AreConcyclic, AreCongruent,  
AreEqual, AreParallel,  
IsTangent commands.

### Barycenter

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Barycenter/>

**语法：**

```
Barycenter( <List of Points>, <List of Weights> )
```

**说明 / 示例：**

This command differs among variants of English:  
Barycenter (US)  
Barycentre (UK + Aus)  
Set the center of a system of points in the list, defined as the average of their positions, weighted by their value,  
using the proper formula.  
Barycenter({(2, 0), (0, 2), (-2, 0), (0, -2)}, {1, 1, 1, 1}) yields point A(0, 0)  
Barycenter({(2, 0), (0, 2), (-2, 0), (0, -2)}, {2, 1, 1, 1}) yields point B(0.4, 0). The x-coordinate of  
this point was determined by ( \frac{1}{ 2+1+1+1 }*(2*2+1*0+1*(-2)+1\*0)) = (\frac{1}{ 5 }\*2) = 0.4

### Centroid

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Centroid/>

**语法：**

```
Centroid( <Polygon> )
```

**说明 / 示例：**

Returns the centroid of the polygon.  
Let A = (1, 4), B = (1, 1), C = (5, 1) and D = (5, 4) be the vertices of a polygon.  
Polygon(A, B, C, D) yields poly1 = 12. Centroid(poly1) yields the centroid E = (3, 2.5).

### Circle

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Circle/>

**语法：**

```
Circle( <Point>, <Radius Number> )
Circle( <Point>, <Segment> )
Circle( <Point>, <Point> )
Circle( <Point>, <Point>, <Point> )
Circle( <Line>, <Point> )
Circle( <Point>, <Radius>, <Direction> )
Circle( <Point>, <Point>, <Direction> )
```

**说明 / 示例：**

Yields a circle with given center and radius.  
Yields a circle with given center and radius equal to the length of the given segment.  
Yields a circle with given center through a given point.  
Yields a circle through the three given points (if they do not lie on the same line).  
See also Compass,  
Circle with Center through Point,  
Circle with Center and Radius, and Circle through 3 Points tools.  
Creates a circle with line as axis and through the point.  
Creates a circle with center, radius, and axis parallel to direction, which can be a line, vector or plane.  
Creates a circle with center, through a point, and axis parallel to direction.  
In order to avoid the ambiguity line/plane of notations in 2D and 3D, don’t use equations like x = 0 or y = 0 for the Direction.  
For example, you want the Direction to be the plane x = 0, use an expression like x + 0y + 0z = 0 instead.  
See also Circle with Axis through Point and Circle with Center, Radius and Direction tools.

### CircularArc

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/CircularArc/>

**语法：**

```
CircularArc( <Midpoint>, <Point A>, <Point B> )
```

**说明 / 示例：**

Creates a circular arc with midpoint between the two points.  
The arc length is displayed in Algebra View.  
Point B does not have to lie on the arc.  
See also  
Circular Arc tool.

### CircularSector

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/CircularSector/>

**语法：**

```
CircularSector( <Midpoint>, <Point A>, <Point B> )
```

**说明 / 示例：**

Creates a circular sector with midpoint between the two points.  
The sector area is displayed in Algebra View  
Point B does not have to lie on the arc of the sector.  
See also  
Circular Sector tool.

### CircumcircularArc

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/CircumcircularArc/>

**语法：**

```
CircumcircularArc( <Point>, <Point>, <Point> )
```

**说明 / 示例：**

Creates a circular arc through three points, where the first point is the starting point and the third point is the  
endpoint of the circumcircular arc.  
See also  
Circumcircular Arc tool.

### CircumcircularSector

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/CircumcircularSector/>

**语法：**

```
CircumcircularSector( <Point>, <Point>, <Point> )
```

**说明 / 示例：**

Creates a circular sector whose arc runs through the three points, where the first point is the starting point and the  
third point is the endpoint of the arc.  
See also  
Circumcircular Sector through Three Points tool.

### Circumference

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Circumference/>

**语法：**

```
Circumference(Conic)
```

**说明 / 示例：**

If the given conic is a circle or ellipse, this command returns its circumference. Otherwise the result is undefined.  
Circumference(x^2 + 2y^2 = 1) yields 5.4.  
See also Perimeter command.

### ClosestPoint

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/ClosestPoint/>

**语法：**

```
ClosestPoint( <Path>, <Point> )
ClosestPoint( <Line>, <Line> )
```

**说明 / 示例：**

Returns a new point on a path which is the closest to a selected point.  
For Functions, this command now uses closest point (rather than vertical point). This works best  
for polynomials; for other functions the numerical algorithm is less stable.  
Returns a new point on the first line which is the closest to the second line.

### ClosestPointRegion

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/ClosestPointRegion/>

**语法：**

```
ClosestPointRegion( <Region>, <Point> )
```

**说明 / 示例：**

Returns a new point on the region which is the closest to a selected point.

### CrossRatio

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/CrossRatio/>

**语法：**

```
CrossRatio( <Point A>, <Point B>, <Point C>, <Point D> )
```

**说明 / 示例：**

Calculates the cross ratio λ of four collinear points A, B, C and D, where: λ =  
AffineRatio[B, C, D] / AffineRatio[A, C, D].  
CrossRatio((-1, 1), (1, 1), (3, 1), (4, 1)) yields 1.2

### Cubic

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Cubic/>

**语法：**

```
Cubic( <Point>, <Point>, <Point>, <Number> )
```

**说明 / 示例：**

Gives n-th triangle cubic of the given triangle ABC.  
Let A = (0, 1), B = (2, 1) and C = (1, 2). Cubic(A, B, C, 2) yields the implicit curve -x³ + 3x² + 5x y² -  
14x y + 7x - 5y² + 14y = 9.  
This command is in development, set of supported index n is changing.  
Some common triangle cubics  
Index n  
Cubic  
1  
Neuberg Cubic  
2  
Thomson Cubic  
3  
McCay Cubic  
4  
Darboux Cubic  
5  
Napoleon/Feuerbach Cubic  
7  
Lucas Cubic  
17  
1st Brocard Cubic  
18  
2nd Brocard Cubic

### Difference

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Difference/>

**语法：**

```
Difference( <Polygon>, <Polygon> )
```

**说明 / 示例：**

Finds the difference of the two polygons.  
Works only for where the polygons are not self-intersecting, and where the resulting pieces don’t have holes.

### Direction

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Direction/>

**语法：**

```
Direction( <Line> )
```

**说明 / 示例：**

Yields the direction vector of the line.  
Direction(-2x + 3y + 1 = 0) yields the vector (u= \begin{pmatrix} 3 \ 2 \end{pmatrix} )  
A line with equation ax + by = c has the direction vector (b, - a).

### Distance

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Distance/>

**语法：**

```
Distance( <Point>, <Object> )
Distance( <Line>, <Line> )
Distance( <Plane>, <Plane> )
```

**说明 / 示例：**

Yields the shortest distance between a point and an object.  
Distance((2, 1), x^2 + (y - 1)^2 = 1) yields 1  
Distance((2, 1, 2), (1, 3, 0)) yields 3  
Let f be a function and A be a point. Distance(A, f) yields the distance between A and (x(A), f(x(A))), that is the distance between point A and ClosestPoint(f, A).  
The command works for points, segments, lines, conics, functions, and implicit curves. For functions, it uses a  
numerical algorithm which works better for polynomials.  
Yields the distance between two lines.  
Distance(y = x + 3, y = x + 1) yields 1.41  
Distance(y = 3x + 1, y = x + 1) yields 0  
Let a: X = (-4, 0, 0) + λ\*(4, 3, 0) and b: X = (0, 0, 0) + λ\*(0.8, 0.6, 0).  Distance(a, b) yields 2.4  
The distance between intersecting lines is 0. Thus, this command is only interesting for parallel lines.  
Yields the distance between the two planes.  
Let eq1: x + y + 2z = 1 and eq2: 2x + 2y + 4z = -2.  Distance(eq1, eq2) yields 0.82  
The distance between intersecting planes is 0. Thus, this command is only meaningful for parallel planes.  
See also  
Distance or Length tool .

### Envelope

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Envelope/>

**语法：**

```
Envelope( <Path>, <Point> )
```

**说明 / 示例：**

Creates the envelope equation of a set of output paths while the  
moving point is bound to another object.  
An envelope is a curve that is tangent to each member of the family of the output paths at some point.  
A ladder is leaning against the wall and sliding down.  
The contour of its trace will be the envelope of the ladder. Strictly speaking, GeoGebra computes the envelope of the  
entire line containing the ladder as a segment. Only such envelopes can be computed where the appropriate construction  
leads to an algebraic equation system.  
See also Locus, LocusEquation commands and  
GeoGebra Automated Reasoning Tools: A Tutorial.

### Incircle

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Incircle/>

**语法：**

```
Incircle( <Point>, <Point>, <Point> )
```

**说明 / 示例：**

Returns Incircle of the triangle formed by the  
three Points.  
Let O=(0, 0), A=(3, 0) and B=(0, 5) be three points: Incircle(O, A, B) yields (x - 1.08)² + (y - 1.08)² =  
1.18 in Algebra View and draws the  
corresponding circle in Graphics  
View.

### InteriorAngles

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/InteriorAngles/>

**语法：**

```
InteriorAngles( <Polygon> )
```

**说明 / 示例：**

Creates all the interior angles of the given polygon.  
See also Angle command and Angle tool.

### Intersect

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Intersect/>

**语法：**

```
Intersect( <Object>, <Object> )
Intersect( <Object>, <Object>, <Index of Intersection Point> )
Intersect( <Object>, <Object>, <Initial Point> )
Intersect( <Function>, <Function>, <Start x-Value>, <End x-Value> )
Intersect( <Curve 1>, <Curve 2>, <Parameter 1>, <Parameter 2> )
Intersect( <Function>, <Function> )
Intersect( <Line> , <Object> ) creates the intersection point(s) of a line and a plane, segment, polygon, conic,
Intersect( <Plane> , <Object> ) creates the intersection point(s) of a plane and segment, polygon, conic, etc.
Intersect( <Conic>, <Conic> ) creates the intersection point(s) of two conics
Intersect( <Plane>, <Plane> ) creates the intersection line of two planes
Intersect( <Plane>, <Polyhedron> ) creates the polygon(s) intersection of a plane and a polyhedron.
Intersect( <Sphere>, <Sphere> ) creates the circle intersection of two spheres
Intersect( <Plane>, <Quadric> ) creates the conic intersection of the plane and the quadric (sphere, cone,
```

**说明 / 示例：**

Yields the intersection points of two objects.  
Let a: -3x + 7y = -10 be a line and c: x^2 + 2y^2 = 8 be an ellipse. Intersect(a, c) yields the  
intersection points E = (-1.02, -1.87) and F = (2.81, -0.22) of the line and the ellipse.  
Intersect(y = x + 3, Curve(t, 2t, t, 0, 10)) yields A=(3, 6).  
Intersect(Curve(2s, 5s, s,-10, 10), Curve(t, 2t, t, -10, 10)) yields A=(0, 0).  
Yields the nth intersection point of two objects. Each object must be a line, conic, polynomial function or implicit  
curve.  
Let a(x) = x^3 + x^2 - x be a function and b: -3x + 5y = 4 be a line. Intersect(a, b, 2) yields the  
intersection point C = (-0.43, 0.54) of the function and the line.  
Yields an intersection point of two objects by using a numerical, iterative method with initial point.  
Let a(x) = x^3 + x^2 - x be a function, b: -3x + 5y = 4 be a line, and C = (0, 0.8) be the initial point.  
Intersect(a, b, C) yields the intersection point D = (-0.43, 0.54) of the function and the line by using a  
numerical, iterative method.  
Yields the intersection points numerically for the two functions in the given interval.  
Let f(x) = x^3 + x^2 - x and g(x) = 4 / 5 + 3 / 5 x be two functions. Intersect(f, g, -1, 2) yields  
the intersection points A = (-0.43, 0.54) and B = (1.1, 1.46) of the two functions in the interval [ -1, 2 ].  
Finds one intersection point using a numerical, iterative method starting at the given parameters.  
Let a = Curve(cos(t), sin(t), t, 0, π) and b = Curve(cos(t) + 1, sin(t), t, 0, π).  
Intersect(a, b, 0, 2) yields the intersection point A = (0.5, 0.87).  
CAS Syntax  
Yields a list containing the intersection points of two objects.  
Let f(x):= x^3 + x^2 - x and g(x):= x be two functions. Intersect(f(x), g(x)) yields the intersection  
points list: {(1, 1), (0, 0), (-2, -2)} of the two functions.  
etc.  
cylinder, …)  
to get all the intersection points in a list you can use eg {Intersect(a,b)}  
See also IntersectConic and IntersectPath  
commands.  
See also  
Intersect tool.

### IntersectPath

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/IntersectPath/>

**语法：**

```
IntersectPath( <Line>, <Polygon> )
IntersectPath( <Polygon>, <Polygon> )
IntersectPath( <Plane>, <Polygon> )
IntersectPath( <Plane>, <Quadric> )
```

**说明 / 示例：**

Creates the intersection path between line and polygon.  
IntersectPath(a, triangle) creates a segment between the first and second intersection point of line a and  
polygon triangle.  
Creates the intersection polygon between two given polygons.  
IntersectPath(quadrilateral, triangle) creates a new polygon as intersection of the two given polygons.  
The new polygon can either be a quadrilateral, a pentagon or a hexagon. This depends on the position of the vertices of  
the given polygons.  
Creates the intersection path between plane and polygon.  
IntersectPath(a, triangle) creates a segment between the first and second intersection point of plane a and  
polygon triangle in the plane of the polygon.  
Creates the intersection path between plane and quadric.  
IntersectPath(a, sphere) creates a circle as intersection between plane a and quadric sphere.  
See also Intersect and IntersectConic commands.

### IsInRegion

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/IsInRegion/>

**语法：**

```
IsInRegion( <Point>, <Region> )
```

**说明 / 示例：**

Returns true if the point is in given region and false otherwise.  
IsInRegion((1,2), Polygon((0,0), (2,0), (1,3))) returns true.

### IsTangent

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/IsTangent/>

**语法：**

```
IsTangent( <Line>, <Conic> )
```

**说明 / 示例：**

Decides if the line is tangent to the conic.  
Normally this command computes the result numerically. This behavior can be changed by using the  
Prove command.  
IsTangent(Line((0,0),(1,0)),Circle((0,1),1)) yields true.  
See also AreCollinear, AreConcurrent,  
AreCongruent, AreConcyclic,  
AreEqual, AreParallel,  
ArePerpendicular commands.

### Length

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Length/>

**语法：**

```
Length( <Object> )
Length( <Vector> ) yields the length of the vector.
Length( <Point> ) yields the length of the position vector of the given point.
Length( <List> ) yields the length of the list, which is the number of elements in the list.
Length( <Text> ) yields the number of characters in the text.
Length( <Locus> ) returns the number of points that the given locus is made up of. Use
Length( <Arc> ) returns the arc length (i.e. just the length of the curved section) of an arc or sector.
Length( <Function>, <Start x-Value>, <End x-Value> )
Length( <Function>, <Start Point>, <End Point> )
Length( <Curve>, <Start t-Value>, <End t-Value> )
Length( <Curve>, <Start Point>, <End Point> )
Length( <Function>, <Variable>, <Start x-Value>, <End x-Value> )
```

**说明 / 示例：**

Yields the length of the object.  
Perimeter(Locus) to get the length of the locus itself. For details see the article about  
First Command.  
Yields the length of the function graph in the given interval.  
Length(2x, 0, 1) returns 2.236067977, about (\sqrt{5}).  
Yields the length of the function graph between the two points.  
If the given points do not lie on the function graph, their x‐coordinates are used to determine the interval.  
Yields the length of the curve between the two values of the parameter.  
Yields the length of the curve between the two points that lie on the curve.  
CAS Syntax  
Calculates the length of a function graph between the two points.  
Length(2 x, 0, 1) yields (\sqrt{5}).  
Calculates the length of a function graph from Start x-value to End x-value.  
Length(2 a, a, 0, 1) yields (\sqrt{5}).  
See also  
Distance or Length tool.

### Line

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Line/>

**语法：**

```
Line( <Point>, <Point> )
Line( <Point>, <Parallel Line> )
Line( <Point>, <Direction Vector> )
```

**说明 / 示例：**

Creates a line through two points A and B.  
Creates a line through the given point parallel to the given line.  
Creates a line through the given point with direction vector v.  
See also Line and  
Parallel Line  
tools.  
You can also use a parametric syntax to create a line eg X = (1, 2) + r (2, 3) or  
X = (1, 2, 3) + r (2, 3, 4)

### Locus

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Locus/>

**语法：**

```
Locus( <Point Creating Locus Line Q>, <Point P>)
Locus( <Point Creating Locus Line Q>, <Slider t>)
Locus( <Slopefield>, <Point> )
Locus( <f(x, y)>, <Point> )
```

**说明 / 示例：**

Returns the locus curve of the point Q, which depends on the point P.  
Point P needs to be a point on an object (e. g. line, segment, circle).  
Returns the locus curve of the point Q, which depends on the values assumed by the slider t.  
Returns the locus curve which equates to the slopefield at the given point.  
Returns the locus curve which equates to the solution of the differential equation (\frac{dy}{dx}=f(x,y)) in  
the given point. The solution is calculated numerically.  
Loci are specific object types, and appear as auxiliary objects.  
Besides Locus command, they are the result of some Discrete Math Commands  
and SolveODE Command. Loci are paths and can be used within  
path-related commands such as Point. Their properties depend on how they were obtained, see  
e.g. Perimeter Command and First Command.  
See also Locus tool.  
Warning  
A locus is undefined when the dependent point is the result of a Point Command with two parameters, or a  
PathParameter Command.

### LocusEquation

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/LocusEquation/>

**语法：**

```
LocusEquation( <Locus> )
LocusEquation( <Point Creating Locus Line Q>, <Point P> )
LocusEquation( <Boolean Expression>, <Free Point> )
```

**说明 / 示例：**

Calculates the equation of a Locus and plots this as an Implicit Curve.  
Calculates the equation of a Locus by using inputs tracer point Q and mover point P, and plots this as an Implicit  
Curve.  
Let us construct a parabola as a locus: Create free Points A and B, and Line d lying through them (this will be  
the directrix of the parabola). Create free point F for the focus. Now create P on Line d (the mover point), then  
create line p as a perpendicular line to d through P. Also create line b as perpendicular bisector of Line  
Segment FP. Finally, point Q (the point creating locus line) is to be created as intersection of Lines p and b.  
Now LocusEquation(Q,P) will find and plot the exact equation of the locus.  
Calculates the locus of the free point such that the boolean condition is satisfied.  
LocusEquation(AreCollinear(A, B, C), A) for free points A, B, C calculates the set of positions of A that  
make A, B and C collinear—i.e. a line through B and C.  
The Locus must be made from a Point (not from a Slider)  
Works only for a restricted set of geometric loci, i.e. using points, lines, circles, conics. (Rays and line segments  
will be treated as (infinite) lines.)  
If the locus is too complicated then it will return 'undefined'.  
If there is no locus then the implicit curve is the empty set 0=1.  
If the locus is the whole plane then the implicit curve is the equation 0=0.  
The calculation is done using Gröbner bases, so sometimes extra  
branches of the curve will appear that were not in the original locus.  
Further information and examples on geogebra.org. A  
collection of implicit locus examples is also available.  
See also Locus command and  
GeoGebra Automated Reasoning Tools: A Tutorial.

### Midpoint

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Midpoint/>

**语法：**

```
Midpoint( <Segment> )
Midpoint( <Conic> )
Midpoint( <Interval> )
Midpoint( <Point>, <Point> )
Midpoint( <Quadric> )
```

**说明 / 示例：**

Returns the midpoint of the segment.  
Let s = Segment((1, 1), (1, 5)). Midpoint(s) yields (1, 3).  
Returns the center of the conic.  
Midpoint(x^2 + y^2 = 4) yields (0, 0).  
Returns the midpoint of the interval (as number).  
Midpoint(2 < x < 4) yields 3.  
Returns the midpoint of two points.  
Midpoint((1, 1), (5, 1)) yields (3, 1).  
Returns the midpoint of the given quadric (e.g. sphere, cone, etc.)  
Midpoint(x^2 + y^2 + z^2 = 1) yields (0, 0, 0).  
See also  
Midpoint or Center tool.

### PathParameter

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/PathParameter/>

**语法：**

```
PathParameter( <Point On Path> )
```

**说明 / 示例：**

Returns the parameter (i.e. a number ranging from 0 to 1) of the point that belongs to a  
path.  
Let f(x) = x² + x - 1 and A is a point attached to this function with coordinates (1,1) (you can create such point using the point on object tool or A=Point(f), SetCoords(A,1,1) commands). Then PathParameter(A) yields a  
= 0.47.  
In the following table (f(x)=\frac{x}{1+|x|}) is a function used to map all real numbers into interval (-1,1) and  
(\phi(X,A,B)=\frac{\overrightarrow{AX}\cdot\overrightarrow{AB}}{|AB|^2}) is a linear map from line AB to reals  
which sends A to 0 and B to 1.  
Line AB  
(\frac{f(\phi(X,A,B))+1}2)  
Ray AB  
(f(\phi(X,A,B)))  
Segment AB  
(\phi(X,A,B))  
Circle with center C and radius r  
Point (X=C+(r\cdot \cos(\alpha),r\cdot \sin(\alpha))), where (\alpha\in ]-\pi,\pi]) has path parameter (\frac{\alpha+\pi}{2\pi})  
Ellipse with center C and semiaxes (\vec{a}), (\vec{b})  
Point (X=C+ \vec{a} \cdot \cos(\alpha) + \vec{b} \cdot \sin(\alpha) ) , where (\alpha\in ]-\pi,\pi]) has path parameter  
(\frac{\alpha+\pi}{2\pi})  
Hyperbola  
Point (X = C \pm \vec{a} · \cosh(t) + \vec{b} · \sinh(t)) has path parameter ( \frac{f(t)+1}{4})  
or (\frac{f(t)+3}{4})  
Parabola with vertex V and direction of axis (\vec{v}).  
Point (V+\frac{1}{2}p\cdot t^2\cdot  
\vec{v}+p\cdot t \cdot \vec{v}^{\perp}) has path parameter (\frac{f(t)+1}2).  
Polyline A1…An  
If X lies on AkAk+1, path parameter of X is (\frac{k-1+\phi(X,A,B)}{n-1})  
Polygon A1…An  
If X lies on AkAk+1 (using An+1=A1), path parameter of X is  
(\frac{k-1+\phi(X,A,B)}{n})  
List of paths L={p1,…,pn}  
If X lies on pk and path parameter of X w.r.t. pk is t, path parameter of X  
w.r.t.L is (\frac{k-1+t}{n})  
List of points L={A1,…,An}  
Path parameter of Ak is (\frac{k-1}{n}). Point[L,t] returns  
(A\_{\lfloor tn\rfloor+1}).  
Locus  
Implicit polynomial  
No formula available.

### Perimeter

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Perimeter/>

**语法：**

```
Perimeter( <Polygon> )
Perimeter( <Conic> )
Perimeter( <Locus> )
```

**说明 / 示例：**

Returns the perimeter of the polygon.  
Perimeter(Polygon((1, 2), (3, 2), (4, 3))) yields 6.58.  
If the given conic is a circle or ellipse, this command returns its perimeter. Otherwise the result is undefined.  
Perimeter(x^2 + 2y^2 = 1) yields 5.4.  
If the given locus is finite, this command returns its approximate perimeter. Otherwise the result is undefined.  
See also Circumference command.

### PerpendicularBisector

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/PerpendicularBisector/>

**语法：**

```
PerpendicularBisector( <Segment> )
PerpendicularBisector( <Point>, <Point> )
PerpendicularBisector( <Point>, <Point>, <Direction>)
```

**说明 / 示例：**

Yields the perpendicular bisector of a segment.  
Yields the perpendicular bisector of a line segment between two points.  
Yields the perpendicular bisector of a line segment between two points which is perpendicular to the direction.  
<Direction> can either be a vector, an axis, a line or a segment.  
See also  
Perpendicular Bisector tool.

### PerpendicularLine

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/PerpendicularLine/>

**语法：**

```
PerpendicularLine( <Point>, <Line> )
PerpendicularLine( <Point>, <Segment> )
PerpendicularLine( <Point>, <Vector> )
PerpendicularLine( <Point>, <Plane> )
PerpendicularLine( <Line> , <Line> )
PerpendicularLine( <Point>, <Direction>, <Direction> )
PerpendicularLine( <Point>, <Line>, <Context> )
PerpendicularLine( <Point>, <Line>, <Plane> ) creates a perpendicular line to the given line through the point and
PerpendicularLine( <Point>, <Line>, space ) creates a perpendicular line to the given line through the point. The
```

**说明 / 示例：**

Creates a line through the point perpendicular to the given line.  
Let c: -3x + 4y = -6 be a line and A = (-2, -3) a point. PerpendicularLine(A, c) yields the line d:  
-4x - 3y = 17.  
For 3D objects a third argument is added to this command to specify the behavior: if 2D view is active, plane z=0 is  
used as third argument, if 3D view is active, space is used instead. See PerpendicularLine( <Point>, <Line>, <Context>  
) further below for details.  
Creates a line through the point perpendicular to the given segment.  
Let c be the segment between the two points A = (-3, 3) and B = (0, 1). PerpendicularLine(A, c) yields the  
line d: -3x + 2y = 15.  
Creates a line through the point perpendicular to the given vector.  
Let u = Vector((5, 3), (1, 1)) and A = (-2, 0) a point. PerpendicularLine(A, u) yields the line c: 2x

- y = -4.    
  Creates a perpendicular line to the plane through the given point.    
  Creates a perpendicular line to the given lines through the intersection point of the two lines.    
  Creates a perpendicular line to the given directions (that can be lines or vectors) through the given point.    
  Creates a perpendicular line to the line through the point and depending on the context.    
  parallel to the plane.    
  two lines have an intersection point. This command yields undefined if the point is on the line in 3D.    
  See also    
  Perpendicular Line tool.

### Point

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Point/>

**语法：**

```
Point( <Object> )
Point( <Object>, <Parameter> )
Point( <Point>, <Vector> )
Point( <List> )
```

**说明 / 示例：**

Returns a point on the geometric object. The resulting point can be moved along the  
path.  
Returns a point on the geometric object with given path parameter.  
Creates a new point by adding the vector to the given point.  
Converts a list containing two numbers into a Point.  
Point({1, 2}) yields (1, 2).  
See also Point tool.  
See also Points and vectors

### PointIn

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/PointIn/>

**语法：**

```
PointIn( <Region> )
```

**说明 / 示例：**

Returns a point restricted to given region.  
See also  
Attach / Detach Point Tool.

### Polygon

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Polygon/>

**语法：**

```
Polygon( <Point>, …, <Point> )
Polygon( <Point>, <Point>, <Number of Vertices> )
Polygon( <List of Points> )
Polygon( <Point>, <Point>, <Number of Vertices n>, <Direction> )
```

**说明 / 示例：**

Returns a polygon defined by the given points.  
Polygon((1, 1), (3, 0), (3, 2), (0, 4)) yields a quadrilateral.  
Creates a regular polygon with n vertices.  
Polygon((1, 1), (4, 1), 6) yields a hexagon.  
Returns a polygon defined by the points in the list.  
Polygon({(0, 0), (2, 1), (1, 3)}) yields a triangle.  
Creates a regular polygon with n vertices, and directed by the direction (e.g. a plane to which the polygon will  
be parallel, if possible).  
See also Polygon and  
Regular Polygon tools.

### Polyline

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Polyline/>

**语法：**

```
Polyline( <List of Points> )
Polyline( <Point>, …, <Point> )
```

**说明 / 示例：**

Creates an open polygonal chain (i.e. a connected series of segments) having the initial vertex in the first point of  
the list, and the final vertex in the last point of the list.  
The polygonal chain length is displayed in the Algebra View.  
Creates an open polygonal chain (i.e. a connected series of segments) having the initial vertex in the first entered  
point, and the final vertex in the last entered point.  
The polygonal chain length is displayed in the Algebra View.  
It is also possible to create a discontinuous polygonal:  
Polyline((1, 3), (4, 3), (?,?), (6, 2), (4, -2), (2, -2)) yields the value 9.47 in  
Algebra View, and the corresponding  
polygonal in Graphics View.  
See also Polygon command.

### Prove

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Prove/>

**语法：**

```
Prove( <Boolean Expression> )
```

**说明 / 示例：**

Returns whether the given boolean expression is true or false in general.  
Normally, GeoGebra decides whether a boolean expression is true or not by using numerical  
computations. However, the Prove command uses symbolic methods to  
determine whether a statement is true or false in general. If GeoGebra cannot determine the answer, the result is  
undefined.  
We define three free points, A=(1,2), B=(3,4), C=(5,6). The command AreCollinear(A,B,C) yields  
true, since a numerical check is used on the current coordinates of the points. Using Prove(AreCollinear(A,B,C))  
you will get false as an answer, since the three points are not collinear in general, i.e. when we change the points.  
Let us define a triangle with vertices A, B and C, and define D=MidPoint(B,C), E=MidPoint(A,C),  
p=Line(A,B), q=Line(D,E). Now both p∥q and Prove(p∥q) yield true, since a midline of a  
triangle will always be parallel to the appropriate side. See also interactive  
version of this example.  
See also ProveDetails command, Boolean values, and  
GeoGebra Automated Reasoning Tools: A Tutorial.

### ProveDetails

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/ProveDetails/>

**语法：**

```
ProveDetails( <Boolean Expression> )
```

**说明 / 示例：**

Returns some details of the result of the automated proof.  
Normally, GeoGebra decides whether a boolean expression is true or not by using numerical  
computations. However, the ProveDetails command uses symbolic methods  
to determine whether a statement is true or false in general. This command works like the  
Prove command, but also returns some details of the result as a list:  
An empty list {} if GeoGebra cannot determine the answer.  
A list with one element: {false}, if the statement is not true in general.  
A list with one element: {true}, if the statement is always true (in all cases when the diagram can be  
constructed).  
A list with more elements, containing the boolean value true and another list for some so-called non-degeneracy  
conditions, if the statement is true under certain conditions, e.g. {true, {"AreCollinear(A,B,C),AreEqual(C,D)"}}.  
This means that if none of the conditions are true (and the diagram can be constructed), then the statement will be  
true.  
A list {true,{"…"}}, if the statement is true under certain conditions, but these conditions cannot be  
translated to human readable form for some reasons.  
Let us define a triangle with vertices A, B and C, and define D=MidPoint(B,C), E=MidPoint(A,C),  
p=Line(A,B), q=Line(D,E). Now ProveDetails(p∥q) returns {true}, which means that if the diagram can  
be constructed, then the midline DE of the triangle is parallel to the side AB.  
Let AB be the segment a, and define C=MidPoint(A,B), b=PerpendicularBisector(A,B),  
D=Intersect(a,b). Now ProveDetails(C==D) returns {true,{"AreEqual(A,B)"}}: it means that if the points A  
and B differ, then the points C and D will coincide.  
Let AB be the segment a, and define l=Line(A,B). Let C be an arbitrary point on line l, moreover let  
b=Segment(B,C), c=Segment(A,C). Now ProveDetails(a==b+c) returns {true,{"a+b==c", "b==a+c"}}: it  
means that if neither (a+b=c), nor (b=a+c), then (a=b+c).  
It is possible that the list of the non-degeneracy conditions is not the simplest possible set. For the above example,  
the simplest set would be the empty set.  
See also Prove command, Boolean values,  
GeoGebra Automated Reasoning Tools: A Tutorial and  
technical details of the algorithms.

### Radius

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Radius/>

**语法：**

```
Radius( <Conic> )
```

**说明 / 示例：**

Returns the radius of a conic.  
Returns the radius of a circle c (e.g. c:(x - 1)² + (y - 1)² = 9) Radius(c) yields a = 3.  
Returns the radius of a circle formula Radius((x - 2)² + (y - 2)² = 16) yields a = 4.

### RandomPointIn

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/RandomPointIn/>

**语法：**

```
RandomPointIn( <Region> )
RandomPointIn( <List of Points> )
RandomPointIn( <xMin>, <xMax>, <yMin>, <yMax> )
```

**说明 / 示例：**

Creates a random point inside a given polygon or closed conic.  
Returns a random point inside the polygon with given vertices.  
RandomPointIn(Polygon(A,B,C)) and RandomPointIn(A,B,C) both give random point inside triangle ABC.  
To get a random point that belongs to the list use Random Element instead.  
Creates a random point with x-coordinate from interval [xMin,xMax] and y-coordinate from interval [yMin, yMax].

### Ray

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Ray/>

**语法：**

```
Ray( <Start Point>, <Point> )
Ray( <Start Point>, <Direction Vector> )
```

**说明 / 示例：**

Creates a ray starting at a point through a point.  
Creates a ray starting at the given point which has the direction vector.  
When computing intersections with other objects, only intersections lying on the ray are considered. To change this,  
you can use Outlying Intersections option.  
See also Ray tool.

### RigidPolygon

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/RigidPolygon/>

**语法：**

```
RigidPolygon( <Polygon> )
RigidPolygon( <Polygon>, <Offset x>, <Offset y> )
RigidPolygon( <Free Point>, …, <Free Point> )
```

**说明 / 示例：**

Creates a copy of any polygon that can only be translated by dragging its first vertex and rotated by dragging its  
second vertex.  
Creates a copy of any polygon with the given offset that can only be translated by dragging its first vertex and  
rotated by dragging its second vertex.  
Creates a polygon whose shape cannot be changed. This polygon can be translated by dragging its first vertex and rotated  
by dragging its second vertex.  
The copy will update with every change of the original polygon. If you want to change the shape of the copy, you have to  
change the original.

### Sector

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Sector/>

**语法：**

```
Sector( <Conic>, <Point>, <Point> )
Sector( <Conic>, <Parameter Value>, <Parameter Value> )
```

**说明 / 示例：**

Yields a conic sector between two points on the conic section and calculates its area.  
Let c: x^2 + 2y^2 = 8 be an ellipse, D = (-2.83, 0) and E = (0, -2) two points on the ellipse.  
Sector(c, D, E) yields d = 4.44.  
Let c: x^2 + y^2 = 9 be a circle, A = (3, 0) and B = (0, 3) two points on the circle.  
Sector(c, A, B) yields d = 7.07  
This works only for a circle or ellipse.  
Yields a conic sector between two parameter values between 0 and 2π on the conic section and calculates its area.  
Let c: x^2 + y^2 = 9 be a circle. Sector(c, 0, 3/4 π) yields d = 10.6  
Internally the following parametric forms are used:  
Circle: (r cos(t), r sin(t)) where r is the circle’s radius.  
Ellipse: (a cos(t), b sin(t)) where a and b are the lengths of the semimajor and semiminor axes.

### Segment

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Segment/>

**语法：**

```
Segment( <Point>, <Point> )
Segment( <Point>, <Length> )
```

**说明 / 示例：**

This command differs among variants of English:  
Interval (Aus)  
Segment (UK + US)  
Creates a segment between two points.  
Creates a segment with the given starting point and length, as well as the end point of the segment.  
When computing intersections with other objects, only intersections lying on the segment are considered. To change  
this, you can use Outlying Intersections option.  
See also Segment and  
Segment_with_Given_Length tools.

### Semicircle

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Semicircle/>

**语法：**

```
Semicircle( <Point>, <Point> )
```

**说明 / 示例：**

Creates a semicircle above the segment between the two points and displays its length in Algebra View.  
See also  
Semicircle tool.

### Slope

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Slope/>

**语法：**

```
Slope( <Line> )
```

**说明 / 示例：**

Returns the slope of the given line.  
This command also draws the slope triangle whose size may be changed on tab Style of the  
Properties Dialog.  
See also Slope tool.

### Tangent

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Tangent/>

**语法：**

```
Tangent( <Point>, <Conic> )
Tangent( <Point>, <Function> )
Tangent( <Point on Curve>, <Curve> )
Tangent( <x-Value>, <Function> )
Tangent( <Line>, <Conic> )
Tangent( <Circle>, <Circle> )
Tangent( <Point>, <Spline> )
Tangent( <Point>, <Implicit Curve> )
```

**说明 / 示例：**

Creates (all) tangents through the point to the conic section.  
Tangent((5, 4), 4x^2 - 5y^2 = 20) yields x - y = 1.  
Creates the tangent to the function at x = x(A).  
Tangent((1, 0), x^2) yields y = 2x - 1.  
x(A) is the x-coordinate of the given point A.  
Creates the tangent to the curve in the given point.  
Tangent((0, 1), Curve(cos(t), sin(t), t, 0, π)) yields y = 1.  
Creates the tangent to the function at x-Value.  
Tangent(1, x^2) yields y = 2x - 1.  
Creates (all) tangents to the conic section that are parallel to the given line.  
Tangent(y = 4, x^2 + y^2 = 4) yields y = 2 and y = -2.  
Creates the common tangents to the two Circles (up to 4).  
Tangent(x^2 + y^2 = 4, (x - 6)^2 + y^2 = 4) yields y = 2, y = -2, 1.49x + 1.67y = 4.47 and -1.49x + 1.67y =  
-4.47.  
Creates the tangent to the spline in the given point.  
Let A = (0, 1), B = (4, 4) and C = (0, 4). Tangent(A, Spline({A, B, C})) yields line a: y = 0.59x + 1.  
Creates the tangent to the implicit curve in the given point.  
Tangent((1,1), x^2+y^2=1) yields lines x=1 and y=1.  
See also Tangents tool.

### TriangleCenter

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/TriangleCenter/>

**语法：**

```
TriangleCenter( <Point>, <Point>, <Point>, <Number> )
```

**说明 / 示例：**

This command differs among variants of English:  
TriangleCenter (US)  
TriangleCentre (UK + Aus)  
gives n-th triangle center of triangle ABC. Works for n < 3054.  
Let A = (1, -2), B = (6, 1) and C = (4, 3). TriangleCenter(A, B, C, 2) yields the centroid D = (3.67,  
0.67) of the triangle ABC.  
Some common triangle centers  
Index n  
Center  
1  
Incenter  
2  
Centroid  
3  
Circumcenter  
4  
Orthocenter  
5  
Nine-point center  
6  
Symmedian point  
7  
Gergonne point  
8  
Nagel point  
13  
First isogonic center

### TriangleCurve

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/TriangleCurve/>

**语法：**

```
TriangleCurve( <Point P>, <Point Q>, <Point R>, <Equation in A, B, C> )
```

**说明 / 示例：**

Creates implicit polynomial, whose equation in  
barycentric coordinates with respect to  
points P, Q, R is given by the fourth parameter; the barycentric coordinates are referred to as A, B, C.  
If P, Q, R are points, TriangleCurve(P, Q, R, (A - B)*(B - C)*(C - A) = 0) gives a cubic curve consisting of  
the medians of the triangle PQR.  
TriangleCurve(A, B, C, A*C = 1/8) creates a hyperbola such that tangent, through A or C, to this hyperbola  
splits triangle ABC in two parts of equal area.  
TriangleCurve(A, B, C, A² + B² + C² - 2B C - 2C A - 2A B = 0) creates the  
Steiner inellipse of the triangle ABC, and  
TriangleCurve(A, B, C, B C + C A + A B = 0) creates the Steiner  
circumellipse of the triangle ABC.  
The input points can be called A, B or C, but in this case you cannot use e.g. x(A) in the equation, because A  
is interpreted as the barycentric coordinate.

### Trilinear

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Trilinear/>

**语法：**

```
Trilinear( <Point>, <Point>, <Point>, <Number>, <Number>, <Number> )
```

**说明 / 示例：**

creates a point whose trilinear coordinates are the given numbers  
with respect to triangle with given points.  
Some examples  
Point  
<Number>  
<Number>  
<Number>  
A  
1  
0  
0  
B  
0  
1  
0  
C  
0  
0  
1  
Circumcenter  
cos((\hat{A}))  
cos((\hat{B}))  
cos((\hat{C}))  
Center of Incircle  
1  
1  
1  
Center of excircle tangent to [BC]  
-1  
1  
1  
Center of excircle tangent to [AC]  
1  
-1  
1  
Center of excircle tangent to [AB]  
1  
1  
-1  
Centroid  
(\frac{1}{a})  
(\frac{1}{b})  
(\frac{1}{c})  
Orthocenter  
cos((\hat{B})) cos((\hat{C}))  
cos((\hat{A})) cos((\hat{C}))  
cos((\hat{A}))cos((\hat{B}))

### Union

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Union/>

**语法：**

```
Union( <List>, <List> )
Union( <Polygon>, <Polygon> )
```

**说明 / 示例：**

Joins the two lists and removes elements that appear multiple times.  
Union( {1, 2, 3, 4, 5}, {3, 2, 1, 7} ) yields {1, 2, 3, 4, 5, 7}.  
Finds the union of the two polygons. Works only for where the polygons are not self-intersecting, and where the union  
is a single polygon.

### Type

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Type/>

**语法：**

```
Type( <Object> )
```

**说明 / 示例：**

For conics and quadrics this command returns a number representing the conic/quadric type according to the table below.  
In this context, an empty conic (or quadric) is one whose coefficients are defined, but that does not contain any real  
point, e.g. x2 + y2 = -1. For conics, GeoGebra distinguishes double line (special case of parallel lines with distance  
0\) and single line (special case of circle with infinite diameter, may result from circle inversion). For quadrics there  
is no such distinction.  
Type(x²+y²=1) yields 4 which stands for circle.  
Value  
Type of conic  
Type of quadric  
1  
Single point  
Single point  
2  
Intersecting lines  
3  
Ellipse  
Ellipsoid  
4  
Circle  
Sphere  
5  
Hyperbola  
6  
Empty  
Empty  
7  
Double line  
8  
Parallel lines  
9  
Parabola  
Paraboloid  
10  
Line  
Line  
30  
Cone  
31  
Cylinder  
33  
Plane  
34  
Parallel planes  
35  
Intersecting planes  
36  
Hyperboloid of one sheet  
37  
Hyperboloid of two sheets  
38  
Parabolic cylinder  
39  
Hyperbolic cylinder  
40  
Hyperbolic paraboloid

### Vertex

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Vertex/>

**语法：**

```
Vertex( <Conic> )
Vertex( <Inequality> )
Vertex( <Polygon> )
Vertex( <Polygon>, <Index n> )
Vertex( <Segment>, <Index> )
```

**说明 / 示例：**

Returns (all) vertices of the conic section.  
Returns the points of intersection of the borders.  
Vertex((x + y < 3) && (x - y > 1)) returns point A = (2, 1).  
{Vertex((x + y < 3) ∧ (x - y > 1) && (y > - 2))} returns list1 = {(2, 1), (5, -2), (-1, -2)}.  
Vertex((y > x²) ∧ (y < x)) returns two points A = (0, 0) and B = (1, 1).  
{Vertex((y > x²) ∧ (y < x))} returns list1 = {(0, 0), (1, 1)}.  
Returns (all) vertices of the polygon.  
Returns n-th vertex of the polygon.  
To get the vertices of the objects polygon / conic / inequality in a list, use {Vertex(Object)}.  
Returns the start-point (Index = 1) or end-point (Index = 2) of the Segment.

## GeoGebra 命令

> 共 11 个命令

### AxisStepX

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/AxisStepX/>

**语法：**

```
AxisStepX( )
```

**说明 / 示例：**

Returns the current step width for the x‐axis.  
See also AxisStepY command.  
Together with the Corner and Sequence commands, the  
AxisStepX and AxisStepY commands allow you to create custom axes (also see section  
Customizing Coordinate Axes and Grid).

### AxisStepY

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/AxisStepY/>

**语法：**

```
AxisStepY( )
```

**说明 / 示例：**

Returns the current step width for the y‐axis.  
See also AxisStepX command.  
Together with the Corner and Sequence commands, the  
AxisStepX and AxisStepY commands allow you to create custom axes (also see section  
Customizing Coordinate Axes and Grid).

### CASLoaded

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/CASLoaded/>

**语法：**

```
CASLoaded()
```

**说明 / 示例：**

Returns a boolean value: true if CAS commands were already loaded, false otherwise.  
The value is dynamic (changes to true when CAS commands are loaded)  
This commands is useful in the web version of GeoGebra where CAS commands are loaded with  
a delay after the app is started. You can use this command together with  
Conditional Visibility to hide some construction elements while  
CAS is loading.

### ConstructionStep

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/ConstructionStep/>

**语法：**

```
ConstructionStep()
ConstructionStep( <Object> )
```

**说明 / 示例：**

Returns the current Construction Protocol step as a number.  
Returns the Construction Protocol step for the given object as a number.

### Corner

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Corner/>

**语法：**

```
Corner( <Number of Corner> )
Corner( <Number of Corner> ) won’t work inside other commands. Instead create eg C_1 = Corner(1) and use that.
Corner( <Graphics View>, <Number of Corner> )
Corner( <Graphics View>, <Number of Corner> ) won’t work inside other commands. Instead create eg
Corner( <Image>, <Number of Corner> )
Corner( <Text>, <Number of Corner> )
Corner( <Text>, <Number of Corner> ) won’t work inside the Sequence or
```

**说明 / 示例：**

For number n = 1, 2, 3, 4 creates a point at the corner of the Graphics View, for n = 5 returns point (w, h), where  
w and h are width and height of the Graphics View in pixels. Always uses  
first  
Graphics View, even if second is active.  
Creates a point at the corner of  
Graphics View (1, 2) which is never visible in that view. Supported values of number n are 1, 2, 3, 4 and 5 as  
above.  
C_1 = Corner(1, 1) and use that.  
Use -1 for the 3D Graphics View's corners (available values for  
Number: from 1 to 8). Moreover:  
Corner(-1,9) returns point (w, h, 0), where w and h are width and height of the 3D Graphics  
View in pixels  
Corner(-1,10) returns point (w, h, 0), where w and h are width and height of the main window in  
pixels  
Corner(-1,11) returns view direction (for parallel projections) or eye position (for e.g. perspective  
projection)  
Corner(-1,12) returns screen left-to-right direction  
Corner(-1,13) returns scales for x, y and z axes.  
Creates a point at the corner of the image (number n = 1, 2, 3, 4).  
Creates a point at the corner of the text (number n = 1, 2, 3, 4).  
Zip commands. Also the Absolute Position on Screen property must be unchecked  
The numbering of the corners is counter‐clockwise and starts at the lower left corner.

### DynamicCoordinates

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/DynamicCoordinates/>

**语法：**

```
DynamicCoordinates( <Point>, <x-Coordinate>, <y-Coordinate> )
DynamicCoordinates( <Point>, <x-Coordinate>, <y-Coordinate>, <z-Coordinate> )
```

**说明 / 示例：**

Creates a new point with given coordinates: this point is dependent, but can be moved. Whenever you try to move the  
new point to coordinates (x, y), the given point is moved there and coordinates for the new point are calculated.  
Works best if the given point is not visible and dragging is done with the mouse. At  
least one of the given coordinates should depend on the given point.  
Let A be a point and B = DynamicCoordinates(A, round(x(A)), round(y(A))). When you try to move B to (1.3,  
2.1) using the Move Tool, point A  
becomes (1.3, 2.1) and B appears at (1,2).  
B = DynamicCoordinates(A, x(A), min(y(A), sin(x(A)))) creates a point under sin(x).  
PointIn(y < sin(x)) is the easier solution in this case.  
The following examples show other ways to restrain the positions of a point C:  
Let A = Point(xAxis) and B = Point(xAxis).  
Now type in the Input Bar:  
DynamicCoordinates(B, Min(x(B), x(A)), 0) and press Enter  
SetVisibleInView(B, 1, false) and press Enter  
SetLayer(C, 1) and press Enter  
Now, C cannot be moved to the right of A.  
Define A=(1, 2).  
Now, type in the Input Bar:  
SetVisibleInView(A, 1, false) and press Enter  
B = DynamicCoordinates(A, If(x(A) > 3, 3, If(x(A) < -3, -3, If(x(A) < 0, round(x(A)), x(A)))), If(x(A) < 0, 0.5, If(y(A) > 2, 2, If(y(A) < 0, 0, y(A)))))  
and press Enter  
This example makes A a sticky point when a point C is dragged near it. Define A = (1, 2) and  
B = (2, 3).  
Now, type in the Input Bar:  
SetVisibleInView(B, 1, false) and press Enter  
C = DynamicCoordinates(B, If(Distance(A, B) < 1, x(A), x(B)), If(Distance(A, B) < 1, y(A), y(B))).  
Creates a new 3D point with given coordinates: this point is dependent, but can be moved. Whenever you try to move the  
new point to coordinates (x, y, z), the given point is moved there and coordinates for the new point are calculated.  
Works best if the given point is not visible and dragging is done with the mouse. At  
least one of the given coordinates should depend on the given point.

### Name

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Name/>

**语法：**

```
Name( <Object> )
```

**说明 / 示例：**

Returns the name of an object as a text in the Graphics View.  
This command works properly only in dynamic text for objects (so that they work after objects are renamed).  
The Name command is the opposite of the Object command.

### Object

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Object/>

**语法：**

```
Object( <Name of Object as Text> )
```

**说明 / 示例：**

This command is deprecated - use in new files is unsupported  
Returns the object for a given name. The result is always a dependent object.  
If points A1, A2, … , A20 exist and also a slider n = 2, then Object("A" + n) creates a copy of point  
A2.  
The Object command is the opposite of the Name command.  
Object command cannot be used in Custom Tools  
Make sure that the objects you refer to are earlier in the Construction_Protocol than this command

### SetConstructionStep

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/SetConstructionStep/>

**语法：**

```
SetConstructionStep( <Number> )
```

**说明 / 示例：**

Changes the construction step to given value. You can use this command to create  
buttons that replace or enhance the Navigation Bar.

### SlowPlot

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/SlowPlot/>

**语法：**

```
SlowPlot( <Function> )
SlowPlot( <Function >, <Boolean Repeat >)
```

**说明 / 示例：**

Creates an animated graph of the given function, that is plotted from left to right. The animation is controlled by a  
slider, which is also created by this command.  
Creates an animated graph of the given function, that is plotted from left to right. The animation is controlled by a  
slider, which is also created by this command: if Repeat is false, the graph is plotted  
only once - corresponding to the slider setting Increasing (once), if Repeat is true or omitted, the graph is  
plotted continuously - corresponding to the slider setting Increasing.

### ToolImage

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/ToolImage/>

**语法：**

```
ToolImage( <Number> )
ToolImage( <Number>, <Point> )
ToolImage( <Number>, <Point>, <Point> )
```

**说明 / 示例：**

Creates in the Graphics View a 32x32 pixel image of the tool icon with given number.  
Creates in the Graphics view a 32x32 pixel image of the tool icon, anchored to the given point.  
Creates in the Graphics view an image of the tool icon. The two given points define two adjacent vertices of the  
side of the oriented square containing the image.  
See Toolbar reference page for the icons numbering, or ToolsEN.

## 列表命令

> 共 39 个命令

### Append

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Append/>

**语法：**

```
Append( <List>, <Object> )
Append( <Object>, <List> )
```

**说明 / 示例：**

Appends the object to the list and yields the results in a new list.  
Append({1, 2, 3}, 4) creates the list {1, 2, 3, 4}.  
Appends the list to the object and yields the results in a new list.  
Append(4, {1, 2, 3}) creates the list {4, 1, 2, 3}.

### Classes

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Classes/>

**语法：**

```
Classes( <List of Data>, <Start>, <Width of Classes> )
Classes( <List of Data>, <Number of Classes> )
```

**说明 / 示例：**

Gives a list of class boundaries. The first boundary (min) is equal to Start, the last boundary (max) will be at  
least the maximum of the List and the boundaries will be equally spaced between min and max.  
Classes({0.1, 0.2, 0.4, 1.1}, 0, 1) gives {0, 1, 2}  
Gives a list of class boundaries. The first boundary (min) is equal to the minimum of the List, the last boundary  
(max) will be the maximum of the List and the boundaries will be equally spaced between min and max.  
Classes({1, 3, 5, 7, 8, 9, 10}, 3) gives {1, 4, 7, 10}  
By convention this uses the a ≤ x < b rule for each class except for the last class which is a ≤ x ≤ b

### CountIf

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/CountIf/>

**语法：**

```
CountIf( <Condition>, <List> )
CountIf( <Condition>, <Variable>, <List> )
```

**说明 / 示例：**

Counts the number of elements in the list satisfying the condition.  
CountIf(x < 3, {1, 2, 3, 4, 5}) gives you the number 2.  
CountIf(x < 3, A1:A10), where A1:A10 is a range of cells in the spreadsheet, counts all cells whose values are  
less than 3.  
For list of numbers arbitrary condition may be used. For list of other objects one can use only conditions of the form  
x==constant or x!=constant.  
As above, using a more flexible syntax.  
Given points P, Q, R CountIf(x(A) < 3, A, {P, Q, R}) will count only the points whose x-coordinate is less  
than 3. The variable A is replaced in turn with P then Q then R for the check. Therefore  
CountIf(x(A) < 3, A, {(0, 1), (4, 2), (2, 2)}) yields the number 2.

### DataFunction

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/DataFunction/>

**语法：**

```
DataFunction( <List of Numbers>, <List of Numbers> )
```

**说明 / 示例：**

Yields a function that connects points (x1, y1), (x2, y2),…,(xn, yn) where {x1, …, xn}, {y1,  
…, yn} are the input lists. In between these points linear interpolation is used. This command is used by Sensors.  
DataFunction({0, 1, 2, 4}, {0, 1, 4, 16}) yields a function that goes through points (0, 0), (1,1), (2, 4), (4,  
16).

### Element

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Element/>

**语法：**

```
Element( <List>, <Position of Element n> )
Element( <Matrix>, <Row>, <Column> )
Element( <List>, <Index1>, <Index2>, …)
```

**说明 / 示例：**

Yields the nth element of the list.  
Element({1, 3, 2}, 2) yields 3, the second element of {1, 3, 2}.  
In the CAS View undefined  
variables can be used as well.  
Element({a, b, c}, 2) yields b, the second element of {a, b, c}.  
Yields the element of the matrix in the given row and column.  
Element({{1, 3, 2}, {0, 3, -2}}, 2, 3) yields -2, the third element of the second row of  
(\begin{pmatrix}1&3&2\0&3&-2\end{pmatrix}).  
In the CAS View undefined  
variables can be used as well.  
Element({{a, b, c}, {d, e, f}}, 2, 3) yields f, the third element of the second row of  
(\begin{pmatrix}a\&b\&c\d\&e\&f\end{pmatrix}).  
Provided list is n-dimensional list, one can specify up to n indices to obtain an element (or list of elements) at  
given coordinates.  
Let L = {{{1, 2}, {3, 4}}, {{5, 6}, {7, 8}}}.  
Then Element(L, 1, 2, 1) yields 3, Element(L, 2, 2) yields {7, 8}.  
This command only works, if the list or matrix contains elements of one object type (e. g. only numbers or only  
points).  
See also First Command, Last Command and  
RandomElement Command.

### First

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/First/>

**语法：**

```
First( <List> )
First( <List>, <Number n of elements> )
First( <Text> )
First( <Text> , <Number n of elements> )
First( <Locus>, <Number n of elements> )
```

**说明 / 示例：**

Gives a new list that contains the first element of the given list.  
First({1, 4, 3}) yields {1}.  
To get the first element use Element({1, 4, 3}, 1).  
Gives a new list that contains just the first n elements of the given list.  
First({1, 4, 3}, 2) yields {1, 4}.  
Gives first character of the text.  
First("Hello") yields "H".  
Gives the first n characters of the text.  
First("Hello",2) yields "He".  
This command is useful for  
loci generated by NSolveODE Command - It returns list points that were created in the  
first n steps of the numeric ODE-solving algorithm.  
loci generated using ShortestDistance Command,  
TravelingSalesman Command, Voronoi Command,  
MinimumSpanningTree Command and ConvexHull  
Command Commands - It returns vertices of the graph.  
See also Last Command.

### Flatten

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Flatten/>

**语法：**

```
Flatten( <List> )
```

**说明 / 示例：**

Flattens lists to one list.  
Flatten({2, 3, {5, 1}, {{2, 1, {3}}}}) yields list1 = {2, 3, 5, 1, 2, 1, 3}.

### Frequency

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Frequency/>

**语法：**

```
Frequency( <List of Raw Data> )
Frequency( <Boolean Cumulative>, <List of Raw Data> )
Frequency( <List of Class Boundaries>, <List of Raw Data> )
Frequency( <List of Text>, <List of Text> )
Frequency( <Boolean Cumulative>, <List of Class Boundaries>,<List of Raw Data> )
Frequency( <List of Class Boundaries>, <List of Raw Data>, <Use Density> , <Density Scale Factor> (optional) )
Frequency( <Boolean Cumulative>, <List of Class Boundaries>, <List of Raw Data>, <Use Density> , <Density Scale Factor>(optional) )
```

**说明 / 示例：**

Returns a list with a count of the occurrences of each unique value in the given list of data. This input list can be  
numbers or text. The list is sorted in ascending order of the unique values. To get a list of the corresponding unique  
values use the Unique Command.  
Enter list1 = { "a", "a", "x", "x", "x", "b" }. Frequency(list1) returns the list { 2, 1, 3 }.  
Unique(list1) returns the list { "a", "b", "x" }.  
If Cumulative = false, returns the same list as Frequency( <List of Raw Data> )  
If Cumulative = true, returns a list of cumulative frequencies for Frequency( <List of Raw Data> ) .  
Enter list1 = { 0, 0, 0, 1, 1, 2 }. Frequency(true, list1) returns the list { 3, 5, 6 }.  
Frequency(false, list1) returns the list { 3, 2, 1}. Unique(list1) returns the list { 0, 1, 2 }.  
Returns a list of the counts of values from the given data list that lie within intervals of the form [a, b), where  
a and b are all the couples of consecutive numbers in the given class boundaries list. The highest interval has  
the form [a, b].  
Frequency({1, 2, 3}, {1, 1, 2, 3}) returns the list { 2, 2 }.  
Returns a contingency matrix containing counts of paired values from the two lists. The rows of the matrix correspond  
to the unique values in the first list, and the columns correspond to the unique values in the second list. To get a  
list of the unique values for each list use the command Unique Command.  
Let list1 = {"a", "b", "b", "c", "c", "c", "c"} and list2 = {"a", "b", "a", "a", "c", "c", "d"}. Then  
Frequency(list1, list2) returns the matrix (\begin{pmatrix} 1 & 0 & 0 & 0\ 1 &1 & 0 &0 \ 1 & 0 & 2 & 1 \  
\end{pmatrix})  
See also the ContingencyTable command.  
If Cumulative = false, returns the same list as Frequency( <List of Class Boundaries>, <List of Raw Data> )  
If Cumulative = true, returns a list of cumulative frequencies for Frequency( <List of Class Boundaries>, <List of  
Raw Data> )  
Returns a list of frequencies for the corresponding Histogram Command.  
If Use density = false, returns the same list as Frequency( <List of Class Boundaries>, <List of Raw Data> )  
If Use density = true, returns the list of frequencies of each class.  
Let data = {1, 2, 2, 2, 3, 3, 4, 4, 4, 4} be the list of raw data and classes={0, 2, 5} the list of class  
boundaries. Then Frequency(classes, data, false) and Frequency(classes, data) both return the list {1,  
9}, while Frequency(classes, data, true) returns the list {0.5, 3}.  
Returns a list of frequencies for the corresponding Histogram Command.

### IndexOf

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/IndexOf/>

**语法：**

```
IndexOf( <Object>, <List> )
IndexOf( <Object>, <List>, <Start Index> )
IndexOf( <Text>, <Text> )
IndexOf( <Text>, <Text>, <Start Index> )
```

**说明 / 示例：**

Returns position of first occurrence of Object in List.  
IndexOf(5, {1, 3, 5, 2, 5, 4}) returns 3.  
When the object is not found, result is undefined.  
Same as above, but the search starts at given index.  
IndexOf(5, {1, 3, 5, 2, 5, 4}, 3) returns 3.  
IndexOf(5, {1, 3, 5, 2, 5, 4}, 4) returns 5.  
IndexOf(5, {1, 3, 5, 2, 5, 4}, 6) returns undefined.  
Specifies the position at which the short text appears for the first time in the whole text.  
IndexOf("Ge", "GeoGebra") returns 1.  
Same as above, but the search starts at given index.  
IndexOf("Ge", "GeoGebra",2) returns 4.

### Insert

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Insert/>

**语法：**

```
Insert( <Object>, <List>, <Position> )
Insert( <List>, <List>, <Position> )
```

**说明 / 示例：**

Inserts the object in the list at the given position.  
Insert(x^2, {1, 2, 3, 4, 5}, 3) places x2 at the third position and creates the list {1, 2, x2, 3, 4, 5}.  
If the position is a negative number, then the position is counted from the right.  
Insert(x^2, {1, 2, 3, 4, 5}, -1) places x2 at the end of the list and creates the list {1, 2, 3, 4, 5,  
x2}.  
Inserts all elements of the first list in the second list at the given position.  
Insert({11, 12}, {1, 2, 3, 4, 5}, 3) places the elements of the first list at the third (and following)  
position(s) of the second list and creates the list {1, 2, 11, 12, 3, 4, 5}.  
If the position is a negative number, then the position is counted from the right.  
Insert({11, 12}, {1, 2, 3, 4, 5}, -2) places the elements of the first list at the end of the second list before  
its last element and creates the list {1, 2, 3, 4, 11, 12, 5}.

### Intersection

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Intersection/>

**语法：**

```
Intersection( <List>, <List> )
```

**说明 / 示例：**

Gives you a new list containing all elements that are part of both lists.  
Let list1 = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15} and  
list2 = {2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30} be two lists. Intersection(list1, list2)  
yields a new list list3 = {2, 4, 6, 8, 10, 12, 14}.

### Join

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Join/>

**语法：**

```
Join( <List>, <List>, … )
Join( <List of Lists> )
```

**说明 / 示例：**

Joins the two (or more) lists.  
Join({5, 4, 3}, {1, 2, 3}) creates the list {5, 4, 3, 1, 2, 3}.  
The new list contains all elements of the initial lists even if they are the same. The elements of the new list are not  
re-ordered.  
Joins the sub-lists into one longer list.  
Join({{1, 2}}) creates the list {1, 2}.  
Join({{1, 2, 3}, {3, 4}, {8, 7}}) creates the list {1, 2, 3, 3, 4, 8, 7}.  
The new list contains all elements of the initial lists even if they are the same. The elements of the new list are not  
re-ordered.

### KeepIf

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/KeepIf/>

**语法：**

```
KeepIf( <Condition>, <List> )
KeepIf( <Condition>, <Variable>, <List> )
```

**说明 / 示例：**

Creates a new list that only contains those elements of the initial list that fulfil the condition.  
KeepIf(x<3, {1, 2, 3, 4, 1, 5, 6}) returns the new list {1, 2, 1}.  
For list of numbers arbitrary condition may be used. For list of other objects one can use only conditions of the form  
x==constant or x!=constant.  
This syntax allows a more flexible condition.  
For Points P, Q, R KeepIf(x(A) < 3, A, {P, Q, R}) will filter the points whose x-coordinate is less than 3  
out of the list. The variable A is replaced in turn with P then Q then R for the check.

### Last

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Last/>

**语法：**

```
Last( <List> )
Last( <List>, <Number of elements> )
Last( <Text> )
Last( <Text> , <Number of elements> )
```

**说明 / 示例：**

Gives a new list that contains the last element of the initial list.  
Last({1, 4, 3}) yields {3}.  
To get the last element use Element({1, 4, 3}, 3).  
Gives a new list that contains just the last n elements of the initial list.  
Last({1, 4, 3}, 2) yields {4, 3}.  
Gives last character of the text.  
Last("Hello") yields "o".  
Gives the last n characters of the text.  
Last("Hello", 2) yields "lo".  
See also First Command.

### Max

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Max/>

**语法：**

```
Max( <List> )
Max( <Interval> )
Max( <Number>, <Number> )
Max( <Function>, <Start x-Value>, <End x-Value> )
Max(<List of Data>, <List of Frequencies> )
```

**说明 / 示例：**

Returns the maximum of the numbers within the list.  
Max({-2, 12, -23, 17, 15}) yields 17.  
If the input consists of non-numeric objects, then this command considers the numbers associated with those objects. If  
you have a list of segments for example, the command Max( <List> ) will yield the maximum segment length.  
Returns the upper bound of the interval.  
Max(2 < x < 3) yields 3.  
Open and closed intervals are treated the same.  
Returns the maximum of the two given numbers.  
Max(12, 15) yields 15.  
Calculates (numerically) the local maximum point of the function in the given interval. The function should be  
continuous, defined over its natural domain (i.e. no domain restrictions are applied), and have only one local maximum point in the interval (and no local minimum).  
Max(exp(x)x^2,-3,-1) creates the point (-2, 0.54134).  
For polynomials you should use the Extremum Command.  
Returns the maximum of the list of data with corresponding frequencies.  
Max({1, 2, 3, 4, 5}, {5, 3, 4, 2, 0}) yields 4, the highest number of the list whose frequency is greater than 0.  
If you want the maximum of two functions f(x) and g(x) then you can define  
(f(x) + g(x) + abs(f(x) - g(x)))/2  
See also Extremum Command, Min Command and  
Function Inspector Tool.  
CAS Syntax  
Unlike in the Algebra View, this syntax will give the maximum over the interval, including endpoints. The function should be  
continuous, defined over its natural domain (i.e. no domain restrictions are applied), and have only one local maximum point in the interval (and no local minimum).  
Max(x^2,-1,2) yields the point (2,4)  
Max(-x^2,-1,2) yields the point (0,0)

### Mean

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Mean/>

**语法：**

```
Mean( <List of Raw Data> )
Mean( <List of Numbers>, <List of Frequencies> )
```

**说明 / 示例：**

Calculates the arithmetic mean of list elements.  
Mean({1, 2, 3, 2, 4, 1, 3, 2}) yields a = 2.25 and  
Mean({1, 3, 5, 9, 13}) yields a = 6.2.  
Calculates the weighted mean of the list elements.  
Mean({1, 2, 3, 4}, {6, 1, 3, 6}) yields a = 2.56 and  
Mean({1, 2, 3, 4}, {1, 1, 3, 6}) yields a = 3.27.  
See also MeanX, MeanY, and SD commands.

### Min

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Min/>

**语法：**

```
Min( <List> )
Min( <Interval> )
Min( <Number>, <Number> )
Min( <Function>, <Start x-Value>, <End x-Value> )
Min( <List of Data>, <List of Frequencies> )
```

**说明 / 示例：**

Returns the minimum of the numbers within the list.  
Min({-2, 12, -23, 17, 15}) yields -23.  
If the input consists of non-numeric objects, then this command considers the numbers associated with those objects. If  
you have a list of segments for example, the command Min( <List> ) will yield the minimum segment length.  
Returns the lower bound of the interval.  
Min(2 < x < 3) yields 2 .  
Open and closed intervals are not distinguished.  
Returns the minimum of the two given numbers.  
Min(12, 15) yields 12.  
Calculates (numerically) the local minimum point for function in the given interval. The function should be  
continuous, defined over its natural domain (i.e. no domain restrictions are applied), and have only one local minimum point in the interval (and no local maximum).  
Min(exp(x) x^3,-4,-2) creates the point (-3, -1.34425) .  
For polynomials you should use the Extremum Command.  
Returns the minimum of the list of data with corresponding frequencies.  
Min({1, 2, 3, 4, 5}, {0, 3, 4, 2, 3}) yields 2, the lowest number of the first list whose frequency is greater  
than 0.  
If you want the minimum of two functions f(x) and g(x) then you can define  
(f(x) + g(x) - abs(f(x) - g(x)))/2  
See also Max Command, Extremum Command and  
Function Inspector Tool.  
CAS Syntax  
Unlike in the Algebra View, this syntax will give the minimum over the interval, including endpoints. The function should be  
continuous, defined over its natural domain (i.e. no domain restrictions are applied), and have only one local minimum point in the interval (and no local maximum).  
Min(x^2,-1,2) yields the point (0,0)  
Min(-x^2,-1,2) yields the point (2,-4)

### Normalize

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Normalize/>

**语法：**

```
Normalize( <List of Numbers> )
Normalize( <List of Points> )
```

**说明 / 示例：**

This command differs among variants of English:  
Normalize (US)  
Normalise (UK + Aus)  
Returns a list containing the normalized form of the given numbers.  
Normalize({1, 2, 3, 4, 5}) returns {0, 0.25, 0.5, 0.75, 1}.  
Returns a list containing the normalized form of the given points.  
Normalize({(1,5), (2,4), (3,3), (4,2), (5,1)}) returns {(0,1), (0.25,0.75), (0.5,0.5), (0.75,0.25), (1,0)}.  
If you are doing calculations using big or small numbers (eg using FitGrowth) then  
normalizing them might avoid rounding/overflow errors  
This command is not applicable to 3D points.  
The operation of normalization maps a value x to the interval [0, 1] using the linear function (x \rightarrow \frac{x-Min(list)}{Max(list)-Min(list)}).

### OrdinalRank

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/OrdinalRank/>

**语法：**

```
OrdinalRank( <List> )
```

**说明 / 示例：**

Returns a list, whose i-th element is the rank of i-th element of list L (rank of element is its position in  
Sort(L)). If there are more equal elements in L which occupy positions from k to l in  
Sort[L], ranks from k to l are associated with these elements.  
OrdinalRank({4, 1, 2, 3, 4, 2}) returns {5, 1, 2, 4, 6, 3}  
OrdinalRank({3, 2, 2, 1}) returns {4, 2, 3, 1}  
Also see command: TiedRank

### PointList

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/PointList/>

**语法：**

```
PointList( <List> )
```

**说明 / 示例：**

Creates list of points from a list of two-element lists.  
PointList({{1,2},{3,4}}) returns {(1,2),(3,4)}.

### Product

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Product/>

**语法：**

```
Product( <List of Raw Data> )
Product( <List of Numbers>, <Number of Elements> )
Product( <List of Numbers>, <List of Frequencies> )
Product( <Expression>, <Variable>, <Start Value>, <End Value> )
Product( <List of Expressions> )
```

**说明 / 示例：**

Calculates the product of all numbers in the list.  
Product({2, 5, 8}) yields 80.  
Calculates the product of the first n elements in the list.  
Product({1, 2, 3, 4}, 3) yields 6.  
Calculates the product of all elements in the list of numbers raised to the value given in the list of frequencies  
for each one of them.  
Product({20, 40, 50, 60}, {4, 3, 2, 1}) yields 1536000000000000  
Product({sqrt(2), cbrt(3), sqrt(5), cbrt(-7)}, {4, 3, 2, 3}) yields -420  
The two lists must have the same length.  
Calculates the product of the expressions that are obtained by replacing the given variable with every integer from the given  
start to the given end values.  
Product(k, k, 1, 7) yields 5040  
Product(x + k, k, 2, 3) yields f(x)=(x + 2)(x + 3).  
CAS Syntax  
Calculates the product of all elements in the list.  
Product({1, 2, x}) yields 2x.  
Calculates the product of the expressions that are obtained by replacing the given variable with every integer from the given  
start to the given end values.  
Product(x + 1, x, 2, 3) yields 12.

### RandomElement

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/RandomElement/>

**语法：**

```
RandomElement( <List> )
```

**说明 / 示例：**

Returns randomly chosen element from the list (with uniform probability). All elements in the list  
must be of the same type.  
RandomElement({3, 2, -4, 7}) yields one of {-4, 2, 3, 7}.  
Hint: In the CAS View this command also works with symbolic input.  
RandomElement({a,b,c,d}) yields one of {a, b, c, d}.  
See also Element Command, SetSeed Command,  
RandomBetween Command, RandomBinomial Command,  
RandomNormal Command, RandomPoisson Command and  
RandomUniform Command.

### RandomPointIn

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/RandomPointIn/>

**语法：**

```
RandomPointIn( <Region> )
RandomPointIn( <List of Points> )
RandomPointIn( <xMin>, <xMax>, <yMin>, <yMax> )
```

**说明 / 示例：**

Creates a random point inside a given polygon or closed conic.  
Returns a random point inside the polygon with given vertices.  
RandomPointIn(Polygon(A,B,C)) and RandomPointIn(A,B,C) both give random point inside triangle ABC.  
To get a random point that belongs to the list use Random Element instead.  
Creates a random point with x-coordinate from interval [xMin,xMax] and y-coordinate from interval [yMin, yMax].

### Remove

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Remove/>

**语法：**

```
Remove( <List>, <List> )
```

**说明 / 示例：**

Removes objects from the first list each time they appear in the second list.  
Remove({1,3,4,4,9},{1,4,5}) yields list {3,4,9}.  
See also RemoveUndefined Command.  
You can also type {1,3,4,4,9} \ {1,4,5} if you want the set-theoretic difference .

### RemoveUndefined

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/RemoveUndefined/>

**语法：**

```
RemoveUndefined( <List> )
```

**说明 / 示例：**

Removes undefined objects from a list.  
RemoveUndefined(Sequence((-1)^k, k, -3, -1, 0.5)) removes the second and fourth element of the sequence since  
expressions ((-1)^{1.5}) and ((-1)^{2.5}) are undefined and yields list {-1, 1, -1}.  
See also Remove Command.

### Reverse

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Reverse/>

**语法：**

```
Reverse( <List> )
```

**说明 / 示例：**

Reverses the order of a list.  
Reverse(list1) reverses list1 = {(1, 2), (3, 4), (5, 6)} to create list2 = {(5, 6), (3, 4), (1, 2)}  
CAS Syntax  
Reverses the order of a list.  
Reverse({1, 2, 3, 4}) reverses the list to create {4, 3, 2, 1}

### RootList

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/RootList/>

**语法：**

```
RootList( <List> )
```

**说明 / 示例：**

Converts a given list of numbers {a1,a2,…,an} to a list of points {(a1,0),(a2,0),…,(an,0)}, which is  
also displayed in the  
Graphics View.  
Command RootList({3, 4, 5, 2, 1, 3}) returns the list of points list1={(3,0), (4,0), (5,0), (2,0), (1,0),  
(3,0)}

### Sample

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Sample/>

**语法：**

```
Sample( <List>, <Size> )
Sample( <List>, <Size>, <With Replacement> )
```

**说明 / 示例：**

Returns list of n randomly chosen elements of a list; elements can be chosen several times.  
Sample({1, 2, 3, 4, 5}, 5) yields for example list1 = {1, 2, 1, 5, 4}.  
Returns list of n randomly chosen elements of a list. Elements can be chosen several times if and only if the last  
parameter is true.  
Sample({1, 2, 3, 4, 5}, 5, true) yields for example list1 = {2, 3, 3, 4, 5}.  
In the CAS View the input list can contain different types of objects:  
Sample({-5, 2, a, 7, c}, 3) yields for example {a, 7, -5}.  
The list can include lists as well: Let List1 be {1, 2, 3}: Sample({List1, 4, 5, 6, 7, 8}, 3, false) yields  
for example {6, {1, 2, 3}, 4}.

### SelectedElement

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/SelectedElement/>

**语法：**

```
SelectedElement( <List> )
```

**说明 / 示例：**

Returns the selected element in a drop-down list.  
See also SelectedIndex command

### SelectedIndex

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/SelectedIndex/>

**语法：**

```
SelectedIndex( <List> )
```

**说明 / 示例：**

Returns the index of the selected element of a drop-down list.  
See also SelectedElement command  
SetValue( <drop-down list>, <Number n > )  
Set n as the index of the selected element in the drop-down list.

### Sequence

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Sequence/>

**语法：**

```
Sequence( <End Value > )
Sequence( <Start value k >, <End value n > )
Sequence( <Start value k>, <End value n>, <Increment> )
Sequence( <Expression>, <Variable k>, <Start Value a>, <End Value b> )
Sequence( <Expression>, <Variable k>, <Start Value a>, <End Value b>, <Increment> )
```

**说明 / 示例：**

Creates a list of integers from 1 to the given end value.  
Sequence(4) creates the list {1, 2, 3, 4}.  
2^Sequence(4) creates the list {2, 4, 8, 16}.  
Creates a list of integers from k to n (increasing or decreasing).  
Sequence(7,13) creates the list {7, 8, 9, 10, 11, 12, 13}  
Sequence(18,14) creates the list {18, 17, 16, 15, 14}  
Sequence(-5, 5) creates the list {-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5}.  
This syntax can be further simplified: instead of using e.g. the formal Sequence(7,13) it is possible to obtain  
the same result by typing in the input bar 7..13 .  
Creates a list of integers from k to n using the given increment.  
Sequence(7,13,2) creates the list {7, 9, 11, 13}  
Sequence(7,13,4) creates the list {7, 11}  
Yields a list of objects created using the given expression and the index k that ranges from start value a to end  
value b.  
Sequence((2, k), k, 1, 5) creates a list of points whose y-coordinates range from 1 to 5: {(2, 1), (2, 2),  
(2, 3), (2, 4), (2, 5)}  
Sequence(x^k, k, 1, 10) creates the list {x, x², x³, x⁴, x⁵, x⁶, x⁷, x⁸, x⁹, x¹⁰}  
Yields a list of objects created using the given expression and the index k that ranges from start value a to end  
value b with given increment.  
Sequence((2, k), k, 1, 3, 0.5) creates a list of points whose y-coordinates range from 1 to 3 with an  
increment of 0.5: {(2, 1), (2, 1.5), (2, 2), (2, 2.5), (2, 3)}  
Sequence(x^k, k, 1, 10, 2) creates the list {x, x³, x⁵, x⁷, x⁹}.  
Since the parameters a and b are dynamic you could use slider variables in both cases above as well.  
See Lists for more information on list operations.

### Shuffle

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Shuffle/>

**语法：**

```
Shuffle( <List> )
```

**说明 / 示例：**

Returns list with same elements, but in random order.  
You can recompute the list via Recompute all objects in  
View Menu (or pressing F9).  
See also RandomElement Command and RandomBetween  
Command.  
CAS Syntax  
Returns list with same elements, but in random order.  
Shuffle({3, 5, 1, 7, 3}) yields for example {5, 1, 3, 3, 7}.  
Shuffle(Sequence(20)) gives the first 20 whole numbers in a random order.

### Sort

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Sort/>

**语法：**

```
Sort( <List> )
Sort( <Values>, <Keys> )
```

**说明 / 示例：**

Sorts a list of numbers, text objects, or points.  
Sort({3, 2, 1}) gives you the list {1, 2, 3}.  
Sort({"pears", "apples", "figs"}) gives you the list elements in alphabetical order.  
Sort({(3, 2), (2, 5), (4, 1)}) gives you {(2, 5), (3, 2), (4, 1)}.  
Lists of points are sorted by x-coordinates.  
Sorts the first list Values according to the corresponding second list Keys.  
In order to sort a list of polynomials list1 = {x^3, x^2, x^6} according to degree, create the dependent list of  
degrees list2 = Zip(Degree(a), a, list1). After that, Sort(list1, list2) yields the requested list3 =  
{x^2, x^3, x^6}.  
In order to draw the polygon having as vertices the complex roots of (x^{10}-1), sorted by their arguments,  
create list1 = {ComplexRoot(x^10-1)}, then use the command Polygon(Sort(list1, arg(list1))). This command  
yields poly1 = 2.94.

### Sum

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Sum/>

**语法：**

```
Sum( <List> )
Sum( <List>, <Number of Elements> )
Sum( <List>, <List of Frequencies> )
Sum( <Expression>, <Variable>, <Start Value>, <End Value> )
```

**说明 / 示例：**

Calculates the sum of all the elements in the list.  
Sum({1, 2, 3}) yields the number a = 6.  
Sum({x^2, x^3}) yields f(x) = x2 + x3.  
Sum(Sequence(i, i, 1, 100)) yields the number a = 5050.  
Sum({(1, 2), (2, 3)}) yields the point A = (3, 5).  
Sum({"a", "b", "c"}) yields the text "abc".  
Calculates the sum of the first n elements in the list.  
Sum({1, 2, 3, 4, 5, 6}, 4) yields the number a = 10.  
Returns the sum of the given list of values, considering the related frequencies.  
Sum({1, 2, 3, 4, 5}, {3, 2, 4, 4, 1}) yields a = 40.  
This command works for numbers, points, vectors, text, and functions.  
Lists must contain objects of the same type.  
CAS Syntax  
The following command works only in the  
CAS View.  
Computes the sum (\sum\_{t=Start Value}^{End Value}f(t)). End value can also be infinity.  
Sum(n^2, n, 1, 3) yields 14.  
Sum(r^k, k, 0, n) yields (\frac{r^{n+1} }{r - 1} - \frac{1}{r - 1}).  
Sum((1/3)^n, n, 0, Infinity) yields (\frac{3}{2}).

### Take

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Take/>

**语法：**

```
Take( <List>, <Start Position> )
Take( <Text>, <Start Position> )
Take( <List>, <Start Position>, <End Position> )
Take( <Text>, <Start Position>, <End Position> )
```

**说明 / 示例：**

Returns a list containing the elements from Start Position to the end of the initial list.  
Take({2, 4, 3, 7, 4}, 3) yields {3, 7, 4}.  
Returns a text containing the elements from Start Position to the end of the initial text.  
Take("GeoGebra", 3) yields the text oGebra.  
Returns a list containing the elements from Start Position to End Position of the initial list.  
Take({2, 4, 3, 7, 4}, 3, 4) yields {3, 7}.  
Returns a text containing the elements from Start Position to End Position of the initial text.  
Take("GeoGebra", 3, 6) yields the text oGeb.

### TiedRank

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/TiedRank/>

**语法：**

```
TiedRank( <List> )
```

**说明 / 示例：**

Returns a list, whose i-th element is the rank of i-th element of the given list L (rank of element is its  
position in Sort(L)). If there are more equal elements in L which occupy positions from  
k to l in Sort[L], the mean of the ranks from k to l are associated with these elements.  
TiedRank({4, 1, 2, 3, 4, 2}) returns {5.5, 1, 2.5, 4, 5.5, 2.5}.  
TiedRank({3, 2, 2, 1}) returns {4, 2.5, 2.5, 1}.  
Also see OrdinalRank Command

### Union

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Union/>

**语法：**

```
Union( <List>, <List> )
Union( <Polygon>, <Polygon> )
```

**说明 / 示例：**

Joins the two lists and removes elements that appear multiple times.  
Union( {1, 2, 3, 4, 5}, {3, 2, 1, 7} ) yields {1, 2, 3, 4, 5, 7}.  
Finds the union of the two polygons. Works only for where the polygons are not self-intersecting, and where the union  
is a single polygon.

### Unique

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Unique/>

**语法：**

```
Unique( <List> )
```

**说明 / 示例：**

Returns list of elements of the given list in ascending order, repetitive elements are included only once. Works for  
both a list of numbers and a list of text.  
Unique({1, 2, 4, 1, 4}) yields {1, 2, 4}.  
Unique({"a", "b", "Hello", "Hello"}) yields {"'Hello", "a", "b"}.  
See also Frequency command.  
CAS Syntax  
Returns a list where each element of the given list occurs only once.  
Unique({1, x, x, 1, a}) yields {1, x, a}.

### Zip

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Zip/>

**语法：**

```
Zip( <Expression>, <Var1>, <List1>, <Var2>, <List2>, …)
```

**说明 / 示例：**

Creates list of objects obtained by substitution of variables in the expression by elements of  
corresponding lists. If the number of variables matches the number of lists, each variable is taken from the following  
list. If the number of variables exceeds number of lists by one, the last variable takes values from 1, 2, 3, …, k  
where k is the length of the shortest list. Length of the resulting list is minimum of lengths of input lists.  
Let P, Q, R, S be some points. Zip(Midpoint(A, B), A, {P, Q}, B, {R, S}) returns a list containing  
midpoints of segments PR and QS.  
Let list1={x^2, x^3, x^6} be a list of polynomials. Zip(Degree(a), a, list1) returns the list {2, 3, 6}.  
Let list1={1, 2, 5} be a list of numbers. Zip(Simplify(a*x^(b-1)), a, list1,b) returns the list {1, 2x,  
5x²}.  
Variables can also be functions: Zip(f(2), f, {x+1,x+3}) returns the list {3, 5}.  
In each list the elements must be of the same type.

## 逻辑命令

> 共 11 个命令

### CountIf

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/CountIf/>

**语法：**

```
CountIf( <Condition>, <List> )
CountIf( <Condition>, <Variable>, <List> )
```

**说明 / 示例：**

Counts the number of elements in the list satisfying the condition.  
CountIf(x < 3, {1, 2, 3, 4, 5}) gives you the number 2.  
CountIf(x < 3, A1:A10), where A1:A10 is a range of cells in the spreadsheet, counts all cells whose values are  
less than 3.  
For list of numbers arbitrary condition may be used. For list of other objects one can use only conditions of the form  
x==constant or x!=constant.  
As above, using a more flexible syntax.  
Given points P, Q, R CountIf(x(A) < 3, A, {P, Q, R}) will count only the points whose x-coordinate is less  
than 3. The variable A is replaced in turn with P then Q then R for the check. Therefore  
CountIf(x(A) < 3, A, {(0, 1), (4, 2), (2, 2)}) yields the number 2.

### If

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/If/>

**语法：**

```
If( <Condition>, <Then> )
If( <Condition>, <Then>, <Else> )
If( <Condition 1>, <Then 1>, <Condition 2>, <Then 2>, … , <Else (optional)> )
```

**说明 / 示例：**

Yields a copy of the object Then if the condition evaluates to true, and an undefined object if it evaluates to  
false.  
Let n = 3. If(n==3, x + y = 4) yields line x + y = 4, because the condition on number n is met.  
Let n = 4. If(n==3, x + y = 4) creates an undefined object, because the condition on number n is not met .  
Yields a copy of object Then if the condition evaluates to true, and a copy of object Else if it evaluates to  
false. Both objects must be of the same type.  
Let n be a number. If(n==3, x + y = 4, x - y = 4) yields line x + y = 4 when n = 3, and line x - y = 4  
for all n not equal to 3.  
Yields a copy of "Then 1" when first condition is satisfied, "Then 2" if second condition is satisfied etc. If none of  
the conditions are satisfied and Else is given, this command yields a copy of Else. Otherwise undefined is returned.  
If(a ≟ 1, "Matthew", a ≟ 2,"Larry", a ≟ 3, "Vivian", "Alex") When a=1 this returns the text "Matthew", for  
a=2' it returns "Larry", for a=3 "Vivian" and for all other values of a it yields "Alex".  
Conditional Functions  
The If command can be used to create conditional functions. Such conditional functions may be used as arguments in any  
command that takes a function argument, such as Derivative,  
Integral, and Intersect.  
f(x) = If(x < 3, sin(x), x^2) yields a piecewise function that equals sin(x) for x < 3 and x2 for x ≥  
3\.  
f(x) = If(0 <= x <= 3, sin(x)) yields a function that equals sin(x) for x between 0 and 3 (and undefined  
otherwise).  
A shorter syntax for this is f(x) = sin(x), 0 <= x <= 3  
f(x) =If(x<-1,x²,-1<=x<=1,1,-x²+2) yields the piecewise function (f(x) = \begin{cases} \begin{array}{rcl}x^{2} & :& x < -1 \  
1 & : &-1 \leq x \leq 1 \\-x^{2} + 2 & :& \text{otherwise}\end{array}\end{cases} ).  
Multivariate Conditional Functions  
The If command can also be used to create multivariate conditional functions. In this case, the definition of the  
pieces of the given function must contain all the variables of the given function.  
Let sliderVal = 1 be a slider in the interval [1,3]. The command  
f(x,y,a,b,c) = If(sliderVal==1, x + 0y +a + 0b + c, sliderVal==2, 0x+ y^2 + 0a +2b +0c, x + y + 0a + b +0c) yields  
a multivariate function that equals x+a+c when the slider value is 1, y2 + 2b when the slider value is 2, and x  
y + b when the slider value is 3.  
Derivative of If(condition, f(x), g(x)) gives If(condition, f'(x), g'(x)). It does not do any evaluation of limits  
at the critical points.  
See section: Boolean values for the symbols used in conditional statements.  
If Command in Scripting  
If command can be used in scripts to perform different actions under certain conditions.  
Let n be a number, and A a point. The command If(Mod(n, 7) == 0, SetCoords(A, n, 0), SetCoords(A, n, 1))  
modifies the coordinates of point A according to the given condition. In this case it would be easier to use  
SetCoords(A, n, If(Mod(n, 7) == 0,0,1)).  
Arguments of If must be Objects or Scripting Commands, not assignments. Syntax  
b = If(a > 1, 2, 3) is correct, but b = 2 or b = 3 would not be accepted as parameters of If.

### IsDefined

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/IsDefined/>

**语法：**

```
IsDefined( <Object> )
```

**说明 / 示例：**

Returns true or false depending on whether the object is defined or not.  
IsDefined(Circle((1,1), -2)) returns false.

### IsFactored

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/IsFactored/>

**语法：**

```
IsFactored( <Polynomial> )
```

**说明 / 示例：**

This command differs among variants of English:  
IsFactored (US)  
IsFactorised (UK + Aus)  
Returns ''true'' if the polynomial is factored in (\mathbb Q) and ''false'' otherwise. In general, in order to consider a polynomial decomposition as factored, the coefficient of the leading term of each factor needs to be positive.  
IsFactored(x) yields true  
IsFactored(0.5) yields true  
IsFactored(5) yields true  
IsFactored(x^2-1) yields false  
IsFactored(x^2-2) yields true  
IsFactored(x(x+1)) yields true  
IsFactored(x(2x+2)) yields false  
IsFactored(x^3-1) yields false  
IsFactored(x(x/2+1/2)) yields false  
IsFactored((x+1)(x^2-1)) yields false  
IsFactored(-2x-2) yields false  
IsFactored(2x+2) yields false

### IsInRegion

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/IsInRegion/>

**语法：**

```
IsInRegion( <Point>, <Region> )
```

**说明 / 示例：**

Returns true if the point is in given region and false otherwise.  
IsInRegion((1,2), Polygon((0,0), (2,0), (1,3))) returns true.

### IsInteger

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/IsInteger/>

**语法：**

```
IsInteger( <Number> )
```

**说明 / 示例：**

Returns true or false depending whether the number is an integer or not.  
IsInteger(972 / 9) returns true.

### IsPrime

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/IsPrime/>

**语法：**

```
IsPrime( <Number> )
```

**说明 / 示例：**

Gives true or false depending on whether the number is prime or not.  
IsPrime(10) yields false,  
IsPrime(11) yields true.  
CAS Syntax  
Gives true or false depending on whether the number is prime or not.  
IsPrime(10) yields false,  
IsPrime(11) yields true.

### IsTangent

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/IsTangent/>

**语法：**

```
IsTangent( <Line>, <Conic> )
```

**说明 / 示例：**

Decides if the line is tangent to the conic.  
Normally this command computes the result numerically. This behavior can be changed by using the  
Prove command.  
IsTangent(Line((0,0),(1,0)),Circle((0,1),1)) yields true.  
See also AreCollinear, AreConcurrent,  
AreCongruent, AreConcyclic,  
AreEqual, AreParallel,  
ArePerpendicular commands.

### IsVertexForm

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/IsVertexForm/>

**语法：**

```
IsVertexForm(<function>)
```

**说明 / 示例：**

Checks if a function is written in vertex form.  
IsVertexForm((x+2/3)^2-(2/3)^2) yields true  
IsVertexForm(2*(3 x-2)^(2)+1) yields false

### KeepIf

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/KeepIf/>

**语法：**

```
KeepIf( <Condition>, <List> )
KeepIf( <Condition>, <Variable>, <List> )
```

**说明 / 示例：**

Creates a new list that only contains those elements of the initial list that fulfil the condition.  
KeepIf(x<3, {1, 2, 3, 4, 1, 5, 6}) returns the new list {1, 2, 1}.  
For list of numbers arbitrary condition may be used. For list of other objects one can use only conditions of the form  
x==constant or x!=constant.  
This syntax allows a more flexible condition.  
For Points P, Q, R KeepIf(x(A) < 3, A, {P, Q, R}) will filter the points whose x-coordinate is less than 3  
out of the list. The variable A is replaced in turn with P then Q then R for the check.

### Relation

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Relation/>

**语法：**

```
Relation( <List> )
Relation( <Object>, <Object> )
```

**说明 / 示例：**

Shows a message box that gives you information about the relation between two or more (up to 4) objects.  
Shows a message box that gives you information about the relation between two objects.  
This command allows you to find out whether  
two lines are perpendicular  
two lines are parallel  
two (or more) objects are equal  
a point lies on a line or conic  
a line is tangent or a passing line to a conic  
three points are collinear  
three lines are concurrent (or parallel)  
four points are concyclic (or collinear).  
Some of these checks can also be performed symbolically. If GeoGebra supports symbolic check for a certain property, the  
"More" button appears. By clicking it, GeoGebra may provide more information whether the property is true in general  
(eventually under certain conditions).  
See also Relation tool.

## 优化命令

> 共 2 个命令

### Maximize

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Maximize/>

**语法：**

```
Maximize( <Dependent number>, <Free number> )
Maximize( <Dependent Number>, <Point on Path> )
```

**说明 / 示例：**

This command differs among variants of English:  
Maximize (US)  
Maximise (UK + Aus)  
Calculates the free number which gives the maximal value of the dependent number. The free number must be a slider and  
the slider interval will be used as the search interval. The relationship should be continuous and have only one  
local maximum point in the interval. If the construction is complicated, this command might return ? to avoid using  
too much processor time.  
Let a be a slider in [0,10] and t1 the right triangle with vertices C=(a, 0), A=(0, 0) and B=(0,10 - a).  
Maximize(t1,a) gives 5, the value of a that maximizes the area of t1.  
Calculates the position of the point which gives the maximal value of the dependent number. The point must be a point on a path and the path will be used as the search interval. The relationship should be continuous and have only one local maximum point in the interval. If the construction is complicated, this command might return ? to avoid using too much processor time.  
Let c be a circle, C a point on it and D a point outside the circle. If f = Segment(C,D) then Maximize(f,C) creates the point on c having maximum distance from D.  
See also Minimize command.

### Minimize

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Minimize/>

**语法：**

```
Minimize( <Dependent number>, <Free number> )
Minimize( <Dependent Number>, <Point on Path> )
```

**说明 / 示例：**

This command differs among variants of English:  
Minimize (US)  
Minimise (UK + Aus)  
Calculates the free number which gives the minimal value of the dependent number. The free number must be a slider and  
the slider interval will be used as the search interval. The relationship should be continuous and have only one  
local minimum in the interval. If the construction is complicated, this command might return ? to avoid using too  
much processor time.  
Let a be a slider in [0,10] and t1 the right triangle with vertices C = (a, 0), A = (0, 0) and B = (0,10 - a). Minimize(t1, a) gives 0, the value of a that minimizes the area of t1 (when the triangle degenerates into a segment).  
Calculates the position of the point which gives the minimal value of the dependent number. The point must be a point on a path and the path will be used as the search interval. The relationship should be continuous and have only one local minimum point in the interval. If the construction is complicated, this command might return ? to avoid using too much processor time.  
Let c be a circle, C a point on it and D a point outside the circle. If f = Segment(C,D) then Minimize(f,C) creates the point on c having minimum distance from D.  
See also Maximize command.

## 概率命令

> 共 46 个命令

### Bernoulli

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Bernoulli/>

**语法：**

```
Bernoulli( <Probability p>, <Boolean Cumulative> )
```

**说明 / 示例：**

For Cumulative = false returns the bar graph of Bernoulli  
distribution where probability of success is equal to p.  
For Cumulative = true returns the bar graph of cumulative Bernoulli distribution.

### BetaDist

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/BetaDist/>

**语法：**

```
BetaDist( <Number α>, <Number β>, <Variable value> )
BetaDist( <Number α>, <Number β>, <Variable value>, <Boolean Cumulative> )
BetaDist(<Number α>, <Number β>, x, <Boolean Cumulative>)
```

**说明 / 示例：**

Calculates the value of the cumulative distribution function of a Beta distribution with parameters α, β at the variable value v, that is the probability P(X≤v) where X is a random variable with a beta distribution with parameters α and β  
If Cumulative is true, calculates the value of the cumulative distribution function of a Beta distribution with parameters α and β at the variable value v. If Cumulative is false, it calculates the value of the probability density function (pdf) of the corresponding beta distribution at v.  
If Cumulative is true, creates the cumulative distribution function of a beta distribution with parameters α and β, otherwise it creates the probability density function (pdf) of the corresponding Beta distribution.  
See also InverseBeta command.

### BinomialDist

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/BinomialDist/>

**语法：**

```
BinomialDist( <Number of Trials>, <Probability of Success> )
BinomialDist( <Number of Trials>, <Probability of Success>, <Boolean Cumulative> )
BinomialDist( <Number of Trials>, <Probability of Success>, <Variable Value>, <Boolean Cumulative> )
BinomialDist( <Number of Trials>, <Probability of Success>, <List of values>)
```

**说明 / 示例：**

Returns a histogram of a Binomial distribution.  
The parameter Number of Trials specifies the number of independent Bernoulli trials and the parameter Probability  
of Success specifies the probability of success in one trial.  
Returns a histogram of a Binomial distribution when Cumulative = false.  
Returns a graph of a cumulative Binomial distribution when Cumulative = true.  
First two parameters are same as above.  
Let X be a Binomial random variable and let v be the variable value.  
Returns P( X = v) when Cumulative = false.  
Returns P( X ≤ v) when Cumulative = true.  
First two parameters are same as above.  
Calculates P(u ≤ X ≤ v) by applying the previous syntax (with Cumulative = false) and adding the values obtained when the elements of the List of values are used as variable values.  
BinomialDist(10, 0.2, {1,2,3}) yields 0.77175, and is equivalent to BinomialDist(10, 0.2, 1, false) + BinomialDist(10, 0.2, 2, false) + BinomialDist(10, 0.2, 3, false)  
The syntaxes BinomialDist(10, 0.2, {1,2,3}) and BinomialDist(10, 0.2, 1..3) are equivalent.  
CAS Syntax  
Let X be a Binomial random variable and let v be the variable value.  
Returns P( X = v) when Cumulative = false.  
Returns P( X ≤ v) when Cumulative = true.  
You can plot a graph with eg f(x):=BinomialDist(100,x,36,true)-BinomialDist(100,x,23,true)  
Assume transferring three packets of data over a faulty line. The chance an arbitrary packet transferred over this line  
becomes corrupted is (\frac{1}{10}), hence the probability of transferring an arbitrary packet successfully is  
(\frac{9}{10}).  
BinomialDist(3, 0.9, 0, false) yields (\frac{1}{1000}), the probability of none of the three packets  
being transferred successfully.  
BinomialDist(3, 0.9, 1, false) yields (\frac{27}{1000}), the probability of exactly one of three  
packets being transferred successfully.  
BinomialDist(3, 0.9, 2, false) yields (\frac{243}{1000}), the probability of exactly two of three  
packets being transferred successfully.  
BinomialDist(3, 0.9, 3, false) yields (\frac{729}{1000}), the probability of all three packets being  
transferred successfully.  
BinomialDist(3, 0.9, 0, true) yields (\frac{1}{1000}), the probability of none of the three packets  
being transferred successfully.  
BinomialDist(3, 0.9, 1, true) yields (\frac{7}{250}), the probability of at most one of three packets  
being transferred successfully.  
BinomialDist(3, 0.9, 2, true) yields (\frac{271}{1000}), the probability of at most two of three  
packets being transferred successfully.  
BinomialDist(3, 0.9, 3, true) yields 1, the probability of at most three of three packets being transferred  
successfully.  
BinomialDist(3, 0.9, 4, false) yields 0, the probability of exactly four of three packets being transferred  
successfully.  
BinomialDist(3, 0.9, 4, true) yields 1, the probability of at most four of three packets being transferred  
successfully.  
Calculates P(u ≤ X ≤ v) by applying the previous syntax (with Cumulative = false) and adding the values obtained when the elements of the List of values are used as variable values.  
BinomialDist(10, 0.2, {1,2,3}) yields (\frac{1507328}{1953125}), and is equivalent to BinomialDist(10, 0.2, 1, false) + BinomialDist(10, 0.2, 2, false) + BinomialDist(10, 0.2, 3, false)

### Cauchy

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Cauchy/>

**语法：**

```
Cauchy( <Median>, <Scale>, <Variable value> )
Cauchy( <Median>, <Scale>, <Variable value>, <Boolean Cumulative>)
Cauchy( <Median>, <Scale>, x, <Boolean Cumulative>)
```

**说明 / 示例：**

Calculates the value of the cumulative density function (cdf) at the given variable value v of a Cauchy distribution, that is the probability P(X≤v) where X is a random variable of a Cauchy distribution of given parameters median and scale.  
Cauchy(1, 2, 3) yields 0.75 in the Algebra View and (\frac{3}{4}) in the  
CAS View.  
This syntax returns the probability for a given value, that is the area under the Cauchy distribution curve to the left of the given x-coordinate.  
If Cumulative is true, calculates the value of a cumulative distribution function of a Cauchy distribution at variable value, otherwise it calculates the value of the probability density function (pdf) at variable value of the given Cauchy distribution of parameters median and scale.  
If Cumulative is true, creates the cumulative distribution function of a Cauchy distribution, otherwise creates the probability density function of the given Cauchy distribution of parameters median and scale.

### ChiSquared

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/ChiSquared/>

**语法：**

```
ChiSquared( <Degrees of Freedom>, <Variable Value> )
ChiSquared( <Degrees of Freedom>, <Variable Value>, <Boolean Cumulative> )
ChiSquared( <Degrees of Freedom>, x, <Boolean Cumulative> )
```

**说明 / 示例：**

Calculates the value of the cumulative distribution function of a Chi squared distribution at variable value v, i.e. the  
probability P(X ≤ v) where X is a random variable with a Chi squared distribution with the given degrees of freedom.  
ChiSquared(4, 3) yields (\gamma\left(2, \frac{3}{2}\right)), which is approximately 0.44.  
This syntax returns the probability at a given x-coordinate’s value, that is the area under the Chi squared distribution curve to the left of the given x-coordinate.  
If Cumulative = true, calculates the value of the cumulative distribution function of a Chi squared distribution with given degrees of freedom at the given variable value, otherwise it calculates the probability density function of the distribution at variable value.  
If Cumulative = true, creates the cumulative density function (cdf) of a Chi squared  
distribution with the given degrees of freedom, otherwise it creates the probability density function (pdf) of the distribution.

### ChiSquaredTest

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/ChiSquaredTest/>

**语法：**

```
ChiSquaredTest( <Matrix> )
ChiSquaredTest( <Observed List>, <Expected List> )
ChiSquaredTest( <Observed Matrix>, <Expected Matrix> )
ChiSquaredTest( <List>, <List>, <Degrees of Freedom> )
```

**说明 / 示例：**

Performs a chi-squared test that compares the given matrix of observed  
counts against the matrix of expected counts determined by the hypothesis of independence.  
The matrix of expected counts is calculated internally. Each expected count is found from the row and column totals of  
the given matrix of observed counts using the rule:  
( \text{expected count} = \frac{\text{row total} × \text{column total}}{\text{total observed counts}} )  
Results are returned in list form as {Probability value, chi-squared test statistic}.  
ChiSquaredTest({{1, 2, 1}, {3, 2, 3}}) yields {0.69, 0.75}.  
Performs a Goodness of Fit test that compares the given list of observed  
counts against the given list of expected counts. To compute the probability, n-1 degrees of freedom are assumed,  
where n is the number of elements in each list. For lists of different sizes the result is undefined.  
Results are returned in list form as {Probability value, chi-squared test statistic}.  
ChiSquaredTest({1, 2, 3, 4}, {3, 2, 4, 2}) yields {0.31, 3.58}.  
Performs a chi-squared test that compares the given matrix of observed  
counts against the given matrix of expected counts. To compute the probability, ((r-1)\cdot(c-1)) degrees of freedom are assumed,  
where r and c are the number of rows and columns in each matrix. For matrices of different size the result is undefined.  
Results are returned in list form as {Probability value, chi-squared test statistic}.  
ChiSquaredTest({{1, 2, 1}, {3, 2, 3}}, {{2, 3, 2}, {4, 2, 3}}) yields {0.45, 1.58}.  
Performs a Goodness of Fit test that compares the given list of observed  
counts against the given list of expected counts, using a specific number of degrees of freedom.  
Results are returned in list form as {Probability value, chi-squared test statistic}.  
For lists of different sizes the result is undefined.  
ChiSquaredTest({1, 2, 3, 4}, {3, 2, 4, 2}, 2) yields {0.17, 3.58}.

### Erlang

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Erlang/>

**语法：**

```
Erlang( <Shape>, <Rate>, <Variable Value> )
Erlang( <Shape>, <Rate>, <Variable Value>, <Boolean Cumulative> )
Erlang( <Shape>, <Rate>, x, <Boolean Cumulative> )
```

**说明 / 示例：**

Calculates the value of cumulative distribution function of an Erlang distribution at variable value v, i.e. the  
probability P(X ≤ v) where X is a random variable with an Erlang distribution defined by the parameters shape and rate.  
This syntax returns the probability at a given value, that is the area under the Erlang distribution curve to the left of the given x-coordinate.  
If Cumulative = true, calculates the value of the cumulative distribution function of an Erlang distribution with given shape and rate at the given variable value, otherwise it calculates the probability density function of the distribution at variable value.  
If Cumulative = true, creates the cumulative density function (cdf) of an Erlang distribution with given shape and rate, otherwise it creates the probability density function (pdf) of the distribution.

### Exponential

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Exponential/>

**语法：**

```
Exponential( <Lambda>, <Variable Value> )
Exponential( <Lambda>, <Variable Value>, <Boolean Cumulative> )
Exponential( <Lambda>, x, <Boolean Cumulative> )
```

**说明 / 示例：**

Calculates the value of the cumulative distribution function of an Exponential distribution at variable value v, i.e. the  
probability P(X ≤ v) where X is a random variable with an Exponential  
distribution defined by the parameter lambda.  
This syntax returns the probability at a given value, that is the area under the Exponential distribution curve to the left of the given x-coordinate.  
If Cumulative = true, calculates the value of the cumulative distribution function of an Exponential distribution with given lambda parameter at the given variable value, otherwise it calculates the probability density function of the distribution at variable value.  
If Cumulative = true, creates the cumulative density function (cdf) of an Exponential distribution with given lambda, otherwise it creates the probability density function (pdf) of the distribution.  
CAS Syntax  
Calculates the value of the cumulative distribution function of an Exponential distribution at variable value v, i.e. the  
probability P(X ≤ v) where X is a random variable with Exponential distribution with parameter lambda.  
Exponential(2, 1) yields (1 - \frac{1}{e^{2} } ), which is approximately 0.86.

### FDistribution

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/FDistribution/>

**语法：**

```
FDistribution( <Numerator Degrees of Freedom>, <Denominator Degrees of Freedom>, <Variable Value> )
FDistribution( <Numerator Degrees of Freedom>, <Denominator Degrees of Freedom>, <Variable Value>, <Boolean Cumulative> )
FDistribution( <Numerator Degrees of Freedom>, <Denominator Degrees of Freedom>, x, <Boolean Cumulative> )
```

**说明 / 示例：**

Calculates the value of the cumulative distribution function of an F-distribution at variable value v, i.e. the probability  
P(X≤v) where X is a random variable with F-distribution with given numerator and denominator degrees of freedom.  
This syntax returns the probability at a given value, that is the area under the F-distribution curve to the left of the given x-coordinate.  
If Cumulative = true, calculates the value of the cumulative distribution function of an F-distribution with given numerator and denominator degrees of freedom at the given variable value, otherwise it calculates the probability density function of the F-distribution at variable value.  
If Cumulative = true, creates the cumulative density function (cdf) of an F-distribution with given numerator and denominator degrees of freedom, otherwise it creates the probability density function (pdf) of the distribution.  
This command is also available in the  
CAS View.

### Gamma

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Gamma/>

**语法：**

```
Gamma( <Alpha>, <Beta>, <Variable Value> )
Gamma( <Alpha>, <Beta>, <Variable Value>, <Boolean Cumulative> )
Gamma( <Alpha>, <Beta>, x, <Boolean Cumulative> )
```

**说明 / 示例：**

Calculates the value of the cumulative distribution function of a Gamma distribution at variable value v, i.e. the  
probability P(X ≤ v) where X is a random variable with a Gamma distribution defined by the parameters alpha and beta.  
This syntax returns the probability at a given value, that is the area under the Gamma distribution curve to the left of the given x-coordinate.  
If Cumulative = true, calculates the value of the cumulative distribution function of a Gamma distribution with given alpha and beta at the given variable value, otherwise it calculates the probability density function of the distribution at variable value.  
If Cumulative = true, creates the cumulative density function (cdf) of a Gamma distribution with given alpha and beta, otherwise it creates the probability density function (pdf) of the distribution.

### HyperGeometric

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/HyperGeometric/>

**语法：**

```
HyperGeometric( <Population Size>, <Number of Successes>, <Sample Size>)
HyperGeometric( <Population Size>, <Number of Successes>, <Sample Size>, <Boolean Cumulative> )
HyperGeometric( <Population Size>, <Number of Successes>, <Sample Size>, <Variable Value>, <Boolean Cumulative> )
```

**说明 / 示例：**

Returns a Hypergeometric distribution bar graph.  
Parameters:  
Population size: number of balls in an urn  
Number of Successes: number of white balls in the urn  
Sample Size: number of balls drawn from the urn  
A random sample is repeatedly extracted from an urn, without replacement. HyperGeometric(100, 50, 5) generates a bar graph showing the probability distribution of the number of white balls in the sample.  
When Cumulative = false returns a bar graph of a Hypergeometric distribution, otherwise it returns the graph of a cumulative Hypergeometric distribution function.  
First three parameters are same as above.  
Let X be a Hypergeometric random variable and v the variable value. The first three parameters are same as above.  
When Cumulative = false it returns P( X = v)  
When Cumulative = true it returns P( X ≤ v)  
Assume you select two balls out of ten balls, two of which are white, without putting any back.  
HyperGeometric(10, 2, 2, 0, false) yields (\frac{28}{45}), the probability of selecting zero white balls,  
HyperGeometric(10, 2, 2, 1, false) yields (\frac{16}{45}), the probability of selecting one white ball,  
HyperGeometric(10, 2, 2, 2, false) yields (\frac{1}{45}), the probability of selecting both white balls,  
HyperGeometric(10, 2, 2, 3, false) yields 0, the probability of selecting three white balls.  
HyperGeometric(10, 2, 2, 0, true) yields (\frac{28}{45}), the probability of selecting zero (or less)  
white balls,  
HyperGeometric(10, 2, 2, 1, true) yields (\frac{44}{45}), the probability of selecting one or less white  
balls,  
HyperGeometric(10, 2, 2, 2, true) yields 1, the probability of selecting two or less white balls and  
HyperGeometric(10, 2, 2, 3, true) yields 1, the probability of selecting three or less white balls.  
CAS Syntax  
In the CAS View you can use  
only the following syntax:  
Let X be a Hypergeometric random variable and v the variable value. The first three parameters are the same as above.  
When Cumulative = false it returns P( X = v)  
When Cumulative = true it returns P( X ≤ v)

### InverseBeta

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/InverseBeta/>

**语法：**

```
InverseBeta( <Number α>, <Number β>, <Probability> )
```

**说明 / 示例：**

Computes the inverse of the Beta cumulative distribution with parameters α and β for a given probability p.  
In other words, the command finds t such that P(X ≤ t) = p, where X is a random variable with a Beta distribution. Probability p is any value in the interval [0,1].  
See also BetaDist command.

### InverseBinomial

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/InverseBinomial/>

**语法：**

```
InverseBinomial( <Number of Trials>, <Probability of Success>, <Cumulative Probability> )
```

**说明 / 示例：**

Returns least integer n such that P(X ≤ n) ≥ p, where p is the probability and X is  
binomial random variable given by Number of Trials and  
Probability of Success.  
See also BinomialDist Command.

### InverseBinomialMinimumTrials

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/InverseBinomialMinimumTrials/>

**语法：**

```
InverseBinomialMinimumTrials(Cumulative Probability, Probability of Success, Number of Successes)
```

**说明 / 示例：**

Returns the minimum number n of trials where the probability of getting at most the given successes does not exceed the cumulative probability.  
InverseBinomialMinimumTrials(0.5, 0.2 ,50) yields 254.

### InverseCauchy

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/InverseCauchy/>

**语法：**

```
InverseCauchy( <Median>, <Scale>, <Probability> )
```

**说明 / 示例：**

Computes the inverse of the cumulative distribution function of a Cauchy  
distribution at probability p, where the Cauchy distribution is defined by parameters median and scale.  
In other words, finds t such that P(X ≤ t) = p, where X is a Cauchy random variable.  
Probability p must be a value in the closed interval [0,1].

### InverseChiSquared

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/InverseChiSquared/>

**语法：**

```
InverseChiSquared( <Degrees of Freedom>, <Probability> )
```

**说明 / 示例：**

Computes the inverse of the cumulative distribution function of a Chi  
squared distribution at probability p, where the Chi squared distribution is defined by the given degrees of freedom.  
In other words, it finds t such that P(X ≤ t) = p, where X is a Chi squared random variable.  
Probability p must be a value in the closed interval [0,1].

### InverseExponential

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/InverseExponential/>

**语法：**

```
InverseExponential( <Lambda>, <Probability> )
```

**说明 / 示例：**

Computes the inverse of the cumulative distribution function of an  
Exponential distribution at probability p, where the  
Exponential distribution is defined by the given parameter lambda.  
In other words, finds t such that P(X ≤ t) = p, where X is an Exponential random variable.  
Probability p must be a value in the closed interval [0,1].

### InverseFDistribution

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/InverseFDistribution/>

**语法：**

```
InverseFDistribution( <Numerator Degrees of Freedom>, <Denominator Degrees of Freedom>, <Probability> )
```

**说明 / 示例：**

Computes the inverse of the cumulative distribution function of an  
F-distribution at probability p, where the F-distribution is defined by  
the given degrees of freedom.  
In other words, it finds t such that P(X ≤ t) = p, where X is a random variable with an F-distribution.  
Probability p must be a value in the closed interval [0,1].

### InverseGamma

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/InverseGamma/>

**语法：**

```
InverseGamma( <Alpha>, <Beta>, <Probability> )
```

**说明 / 示例：**

Computes the inverse of the Gamma cumulative distribution with parameters α and β for a given probability p.  
In other words, the command finds t such that P(X ≤ t) = p, where X is a random variable with a Gamma distribution. Probability p is any value in the interval [0,1].

### InverseHyperGeometric

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/InverseHyperGeometric/>

**语法：**

```
InverseHyperGeometric( <Population Size>, <Number of Successes>, <Sample Size>, <Probability> )
```

**说明 / 示例：**

Returns least integer n such that P(X ≤ n) ≥ p, where p is the probability and X is  
hypergeometric random variable given by Population Size,  
Number of Successes and Sample Size.  
See also HyperGeometric Command.

### InverseLogNormal

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/InverseLogNormal/>

**语法：**

```
InverseLogNormal( <Mean>, <Standard Deviation>, <Probability> )
```

**说明 / 示例：**

Computes the inverse of the cumulative distribution function of a  
log-normal distribution at probability p, where the log-normal  
distribution is defined by the given parameters mean and standard deviation.  
In other words, it finds t such that P(X ≤ t) = p, where X is a log-normal random variable.  
Probability p must be a value in the closed interval [0, 1].  
InverseLogNormal(10, 20, 1/3) returns 3.997.  
InverseLogNormal(1000, 2, 1) returns ( \infty ).

### InverseLogistic

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/InverseLogistic/>

**语法：**

```
InverseLogistic( <Mean>, <Scale>, <Probability> )
```

**说明 / 示例：**

Computes the inverse of the cumulative distribution function of a  
Logistic distribution at probability p, where the Logistic  
distribution is defined by the given parameters mean and scale.  
In other words, it finds t such that P(X ≤ t) = p, where X is a Logistic random variable.  
Probability p must be a value in the closed interval [0,1].  
InverseLogistic(100, 2, 1) yields ( \infty ).

### InverseNormal

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/InverseNormal/>

**语法：**

```
InverseNormal( <Mean>, <Standard Deviation>, <Probability> )
```

**说明 / 示例：**

Evaluates the expression (\Phi^{-1}(P) \cdot \sigma + \mu ) at given probability P, where (\Phi^{-1}) is the inverse of the cumulative distribution function Φ for N(0,1), defined by the given parameters mean and standard deviation.  
Returns the x-coordinate of the point with the given probability (area) to the left, under the normal distribution curve.  
InverseNormal(50, 2, 0.9) yields 52.56, that is the 90th percentile of a normal distribution with a mean of 50 and standard deviation 2.

### InversePascal

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/InversePascal/>

**语法：**

```
InversePascal( <n>, <p>, <Probability> )
```

**说明 / 示例：**

Returns least integer n such that P(X≤n) ≥ p, where p is the probability and X is  
Pascal random variable given by n and p.  
See also Pascal Command.

### InversePoisson

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/InversePoisson/>

**语法：**

```
InversePoisson( <Mean>, <Probability> )
```

**说明 / 示例：**

Returns the least integer n such that P(X≤n) ≥ p, where p is the given probability and X is a Poisson random variable with  
given mean.  
See also Poisson Command.

### InverseTDistribution

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/InverseTDistribution/>

**语法：**

```
InverseTDistribution( <Degrees of Freedom>, <Probability> )
```

**说明 / 示例：**

Evaluates at p the inverse of the cumulative distribution function of a  
t-distribution with the given number of degrees of freedom. In other words, it finds r such that P(X≤r)=p, where X is a random variable with a t-distribution. Probability  
p must be a value in the closed interval [0,1].

### InverseWeibull

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/InverseWeibull/>

**语法：**

```
InverseWeibull( <Shape>, <Scale>, <Probability> )
```

**说明 / 示例：**

Evaluates the inverse of the cumulative distribution function of a Weibull  
distribution at given p, where the Weibull distribution is defined by the given parameters shape and scale. In other  
words, it finds t such that P(X ≤ t) = p, where X is a random variable with Weibull distribution. Probability p  
must be a value in the closed interval [0,1].

### InverseZipf

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/InverseZipf/>

**语法：**

```
InverseZipf( <Number of Elements>, <Exponent>, <Probability> )
```

**说明 / 示例：**

Returns the least integer n such that P(X≤n) ≥ p, where X is a Zipf  
random variable defined by the given number of elements and exponent, and p is the probability.  
See also Zipf Command.

### LogNormal

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/LogNormal/>

**语法：**

```
LogNormal( <Mean>, <Standard Deviation>, <Variable Value> )
LogNormal( <Mean>, <Standard Deviation>, <Variable Value>, <Boolean Cumulative> )
LogNormal( <Mean>, <Standard Deviation>, x, <Boolean Cumulative> )
```

**说明 / 示例：**

Evaluates the cumulative distribution function of a log-normal distribution at variable value, i.e. calculates the  
probability P(X ≤ v) where X is a random variable with a log-normal distribution defined by the given parameters mean and  
standard deviation.  
If Cumulative = true, evaluates the cumulative distribution function of a log-normal distribution with given mean and standard deviation at the given variable value, otherwise it evaluates the probability density function of the distribution at variable value.  
If Cumulative = true, creates the cumulative density function (cdf) of a log-normal distribution with given mean and standard deviation, otherwise it creates the probability density function (pdf) of the distribution.  
This syntax returns the probability at a given value, that is the area under the log-normal distribution curve to the left of the given x-coordinate.

### Logistic

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Logistic/>

**语法：**

```
Logistic( <Mean>, <Scale>, <Variable Value> )
Logistic( <Mean>, <Scale>, <Variable Value>, <Boolean Cumulative> )
Logistic( <Mean>, <Scale>, x, <Boolean Cumulative> )
```

**说明 / 示例：**

Evaluates the cumulative distribution function of a logistic distribution at variable value v, i.e. calculates the  
probability P(X ≤ v) where X is a random variable with a logistic distribution defined by the given parameters mean and scale.  
This syntax returns the probability at a given value, that is the area under the logistic distribution curve to the left of the given x-coordinate.  
If Cumulative = true, evaluates the cumulative distribution function of a logistic distribution with given mean and scale at the given variable value, otherwise it evaluates the probability density function of the distribution at variable value.  
If Cumulative = true, creates the cumulative density function (cdf) of a logistic distribution with given mean and scale, otherwise it creates the probability density function (pdf) of the distribution.

### Normal

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Normal/>

**语法：**

```
Normal( <Mean>, <Standard Deviation>, <Variable Value> )
Normal( <Mean>, <Standard Deviation>, <Variable Value>, <Boolean Cumulative> )
Normal( <Mean>, <Standard Deviation>, <Variable Value u> , <Variable Value v>)
Normal( <Mean>, <Standard Deviation>, x, <Boolean Cumulative> )
```

**说明 / 示例：**

Evaluates the function (\Phi \left(\frac{x- \mu}{\sigma} \right) ) at variable value v, where Φ is the cumulative  
distribution function of the standard normal distribution N(0,1).  
Normal(2, 0.5, 1) yields 0.02 in the  
Algebra View and (\frac{erf(-\sqrt{2})+1}{2}) in the  
CAS View.  
This syntax returns the probability at a given value, that is the area under the normal distribution curve to the left of the given x-coordinate.  
If Cumulative = true, evaluates the cumulative distribution function of a normal distribution with given mean and standard deviation at the given variable value, otherwise it evaluates the probability density function of the distribution at variable value.  
Computes the probability of a normal random variable in the interval [u, v], given the mean and the standard deviation. In other words, the syntax Normal(m, s, u, v) is equivalent to Normal(m, s, v, true) - Normal(m, s, u, true)  
If Cumulative = true, creates the cumulative density function (cdf) of a normal distribution with given mean and standard deviation, otherwise it creates the probability density function (pdf) of the distribution.

### Pascal

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Pascal/>

**语法：**

```
Pascal( <n>, <p> )
Pascal( <n>, <p>, <Boolean Cumulative> )
Pascal( <n>, <p>, <Variable Value>, <Boolean Cumulative> )
```

**说明 / 示例：**

Returns a bar graph of a Pascal distribution.  
The Pascal distribution models the number of failures before the nth success in repeated mutually independent  
Bernoulli trials, each with probability of success p.  
Returns a bar graph of a Pascal distribution when Cumulative = false.  
Returns a graph of a cumulative Pascal distribution when Cumulative = true.  
First two parameters are same as above.  
Let X be a Pascal random variable and v the variable value.  
Returns P( X = v) when Cumulative = false.  
Returns P( X ≤ v) when Cumulative = true.  
First two parameters are same as above.  
If the number of independent Bernoulli trials that must be successful is n = 1, the probability of success in one trial  
is p = (\frac{1}{6}), then the probability of 2 failures before the success is given by  
Pascal(1, 1/6, 2, false) which yields 0.12 in the Algebra View and 25/216 in the  
CAS View.  
This command also works in the  
CAS View.

### Poisson

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Poisson/>

**语法：**

```
Poisson( <Mean> )
Poisson( <Mean>, <Boolean Cumulative> )
Poisson( <Mean>, <Variable Value v>, <Boolean Cumulative> )
```

**说明 / 示例：**

Returns a bar graph of a Poisson distribution with given mean λ.  
Returns a bar graph of a Poisson distribution when Cumulative = false.  
Returns a graph of a cumulative Poisson distribution when Cumulative = true.  
The first parameter is same as above.  
Let X be a Poisson random variable.  
Returns P( X = v) when Cumulative = false.  
Returns P( X ≤ v) when Cumulative = true.  
First parameter is same as above.  
Poisson(3, 1, true) yields 0.2 in the Algebra View and (\frac{4}{e³}) in the CAS View.  
Poisson(3, 1, false) yields 0.15 in the Algebra View and (\frac{3}{e³}) in the CAS View.  
A simplified syntax is available to calculate P(u ≤ X ≤ v): e.g. Poisson(1, 1..5) yields 0.63153, that is  
the same as Poisson(1, {1, 2, 3, 4, 5}).

### RandomBetween

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/RandomBetween/>

**语法：**

```
RandomBetween( <Minimum Integer> , <Maximum Integer> )
RandomBetween( <Minimum Integer> , <Maximum Integer> , <Boolean Fixed> )
RandomBetween( <Minimum Integer> , <Maximum Integer>, <Number of Samples> )
```

**说明 / 示例：**

Generates a random integer between minimum and maximum (inclusive).  
RandomBetween(0, 10) yields a number between 0 and 10 (inclusive)  
If Boolean Fixed = "true", it generates a random integer between minimum and maximum (inclusive), which is  
updated just once (when file is loaded and also on undo/redo).  
RandomBetween(0, 10, true) yields a number between 0 and 10 (inclusive)  
Press F9 to see the difference between those two syntaxes.  
Generates a list of random integers between minimum and maximum (inclusive). The number of random integers in the  
list is the number of samples.  
RandomBetween(0, 10, 5) yields {1,3,4,8,2}, or {7,5,6,1,7}, etc.  
See also SetSeed command, RandomElement command,  
RandomBinomial command, RandomNormal command,  
RandomPoisson command, RandomUniform command.

### RandomBinomial

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/RandomBinomial/>

**语法：**

```
RandomBinomial( <Number of Trials>, <Probability> )
```

**说明 / 示例：**

Generates a random number from a binomial distribution with n trials and probability p.  
RandomBinomial(3, 0.1) gives j ∈ {0, 1, 2, 3}, where the probability of getting j is the probability of an  
event with probability 0.1 occurring j times in three tries.  
See also SetSeed command, RandomBetween command,  
RandomElement command, RandomNormal command,  
RandomPoisson command, RandomUniform command.

### RandomDiscrete

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/RandomDiscrete/>

**语法：**

```
RandomDiscrete( <List>, <List> )
```

**说明 / 示例：**

Returns a random number from the first list according to the (relative) probability distribution defined in the second list. The two lists must have the same length, and the sum of values in the second list may not be 1, since the probabilities are normalized.

### RandomNormal

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/RandomNormal/>

**语法：**

```
RandomNormal( <Mean>, <Standard Deviation> )
```

**说明 / 示例：**

Generates a random number from a normal distribution with given mean and standard deviation.  
RandomNormal(3, 0.1) yields a random value from a normal distribution with a mean of 3 and standard deviation of  
0.1.  
See also SetSeed command, RandomBetween command,  
RandomElement command, RandomBinomial command,  
RandomPoisson command, RandomUniform command.

### RandomPointIn

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/RandomPointIn/>

**语法：**

```
RandomPointIn( <Region> )
RandomPointIn( <List of Points> )
RandomPointIn( <xMin>, <xMax>, <yMin>, <yMax> )
```

**说明 / 示例：**

Creates a random point inside a given polygon or closed conic.  
Returns a random point inside the polygon with given vertices.  
RandomPointIn(Polygon(A,B,C)) and RandomPointIn(A,B,C) both give random point inside triangle ABC.  
To get a random point that belongs to the list use Random Element instead.  
Creates a random point with x-coordinate from interval [xMin,xMax] and y-coordinate from interval [yMin, yMax].

### RandomPoisson

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/RandomPoisson/>

**语法：**

```
RandomPoisson( <Mean> )
```

**说明 / 示例：**

Generates a random number from a Poisson distribution with given mean.  
RandomPoisson(3) yields a random value from a Poisson distribution with a mean of 3.  
See also SetSeed command, RandomBetween command,  
RandomElement command, RandomBinomial command,  
RandomNormal command, RandomUniform command.

### RandomPolynomial

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/RandomPolynomial/>

**语法：**

```
RandomPolynomial( <Degree> , <Minimum for Coefficients>, <Maximum for Coefficients> )
RandomPolynomial( <Variable>, <Degree> , <Minimum for Coefficients>, <Maximum for Coefficients> )
```

**说明 / 示例：**

Returns a randomly generated polynomial in x of degree d, whose (integer) coefficients are in the range from  
minimum to maximum, both included.  
RandomPolynomial(0, 1, 2) yields either 1 or 2.  
RandomPolynomial(2, 1, 2) yields a random polynomial with a degree of two and only 1 and 2 as coefficients,  
for example 2x2 + x + 1.  
CAS Syntax  
The following command is only available in the  
CAS View.  
Returns a randomly generated polynomial in Variable of degree d, whose (integer) coefficients are in the range  
from minimum to maximum, both included.  
RandomPolynomial(a, 0, 1, 2) yields either 1 or 2.  
RandomPolynomial(a, 2, 1, 2) yields a random polynomial with a degree of two and only 1 and 2 as  
coefficients, for example 2a2 + a + 1.  
In both cases if minimum or maximum are not integers, round(minimum) and round(maximum) are used instead.

### RandomUniform

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/RandomUniform/>

**语法：**

```
RandomUniform( <Min>, <Max> )
RandomUniform( <Min>, <Max>, <Number of Samples n> )
```

**说明 / 示例：**

Returns random real number from uniform distribution  
on interval [min, max].  
RandomUniform(0, 1) returns a random number between 0 and 1  
Returns a list of n random real numbers from uniform  
distribution on interval [min, max].  
RandomUniform(0, 1, 3) returns a list of three random numbers between 0 and 1  
RandomUniform(0,1) is equivalent to random() (see Predefined  
Functions and Operators).  
See also SetSeed, RandomBetween,  
RandomElement, RandomBinomial,  
RandomNormal , RandomPoisson commands.

### TDistribution

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/TDistribution/>

**语法：**

```
TDistribution( <Degrees of Freedom>, <Variable Value> )
TDistribution( <Degrees of Freedom>, <Variable Value>, <Boolean Cumulative> )
TDistribution( <Degrees of Freedom>, x, <Boolean Cumulative> )
```

**说明 / 示例：**

Evaluates the cumulative distribution function of a t-distribution at variable value v, i.e. calculates the  
probability P(X ≤ v) where X is a random variable with a t-distribution with the given degrees of freedom.  
TDistribution(10, 0) yields 0.5.  
This syntax returns the probability at a given value, that is the area under the t-distribution curve to the left of the given x-coordinate.  
If Cumulative = true, evaluates the cumulative distribution function of a t-distribution with given degrees of freedom at the given variable value, otherwise it evaluates the probability density function of the distribution at variable value.  
If Cumulative = true, creates the cumulative density function (cdf) of a t-distribution with given degrees of freedom, otherwise it creates the probability density function (pdf) of the distribution.  
CAS Syntax  
Evaluates the cumulative distribution function of a t-distribution at variable value v, i.e. calculates the  
probability P(X ≤ v) where X is a random variable with a t-distribution with the given degrees of freedom.  
TDistribution(10, 0) yields 0.5.

### Triangular

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Triangular/>

**语法：**

```
Triangular( <Lower Bound>, <Upper Bound>, <Mode>, <Variable Value> )
Triangular( <Lower Bound>, <Upper Bound>, <Mode>, <Variable Value>, <Boolean Cumulative> )
Triangular( <Lower Bound>, <Upper Bound>, <Mode>, x, <Boolean Cumulative> )
```

**说明 / 示例：**

Evaluates the cumulative distribution function of a triangular distribution at variable value v, i.e. calculates the  
probability P(X ≤ v) where X is a random variable with a triangular distribution in [lower bound, upper bound] with the given mode.  
Triangular(0, 5, 2, 2) yields 0.4.  
This syntax returns the probability at a given value, that is the area under the triangular distribution curve to the left of the given x-coordinate.  
If Cumulative = true, evaluates the cumulative distribution function of a triangular distribution  
with given mode at the given variable value in [lower bound, upper bound], otherwise it evaluates the probability density function of the distribution at variable value.  
If Cumulative is true, creates the cumulative distribution function of a triangular distribution with given mode in [lower bound, upper bound], otherwise it creates the probability density function of a triangular distribution with given mode in [lower bound, upper bound].

### Uniform

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Uniform/>

**语法：**

```
Uniform( <Lower Bound>, <Upper Bound>, <Variable Value> )
Uniform( <Lower Bound>, <Upper Bound>, <Variable Value>, <Boolean Cumulative> )
Uniform( <Lower Bound>, <Upper Bound>, x, <Boolean Cumulative> )
```

**说明 / 示例：**

Evaluates the cumulative distribution function of a uniform distribution at variable value v, i.e. calculates the  
probability P(X ≤ v) where X is a random variable with a uniform distribution in [lower bound, upper bound].  
If Cumulative = true, evaluates the cumulative distribution function of a uniform  
distribution at the given variable value in [lower bound, upper bound], otherwise it evaluates the probability density function of the distribution at variable value.  
If Cumulative is true, creates the cumulative distribution function of a uniform distribution in [lower bound, upper bound], otherwise it creates the probability density function of a uniform distribution in [lower bound, upper bound].

### Weibull

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Weibull/>

**语法：**

```
Weibull( <Shape>, <Scale>, <Variable Value> )
Weibull( <Shape>, <Scale>, <Variable Value>, <Boolean Cumulative> )
Weibull( <Shape>, <Scale>, x, <Boolean Cumulative> )
```

**说明 / 示例：**

Evaluates the cumulative distribution function of a Weibull distribution at variable value v, i.e. calculates the  
probability P(X ≤ v) where X is a random variable with a Weibull distribution defined by the given parameters shape and scale.  
Weibull(0.5, 1, 0) yields 0.  
Weibull(0.5, 1, 1) yields (1 - \frac{1} { e } ).  
This syntax returns the probability at a given value, that is the area under the Weibull distribution curve to the left of the given x-coordinate.  
If Cumulative = true, evaluates the cumulative distribution function of a Weibull distribution with given shape and scale at the given variable value, otherwise it evaluates the probability density function of the distribution at variable value.  
If Cumulative = true, creates the cumulative density function (cdf) of a Weibull distribution with given shape and scale, otherwise it creates the probability density function (pdf) of the distribution.

### Zipf

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Zipf/>

**语法：**

```
Zipf( <Number of Elements>, <Exponent> )
Zipf( <Number of Elements>, <Exponent> , <Boolean Cumulative> )
Zipf( <Number of Elements>, <Exponent> , <Variable Value v>, <Boolean Cumulative> )
```

**说明 / 示例：**

Returns a bar graph of a Zipf distribution.  
Parameters:  
Number of Elements: number of elements whose rank we study  
Exponent: exponent characterizing the distribution  
Returns a bar graph of a Zipf distribution when Cumulative = false.  
Returns a graph of a cumulative Zipf distribution when Cumulative = true.  
First two parameters are same as above.  
Let X be a Zipf random variable.  
Returns P( X = v) when Cumulative = false.  
Returns P( X ≤ v) when Cumulative = true.  
First two parameters are same as above.  
Zipf(10, 1 , 5, false) yields 0.07 in the Algebra View and (\frac{504}{7381}) in the  
CAS View.

## 脚本命令

> 共 67 个命令

### AttachCopyToView

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/AttachCopyToView/>

**语法：**

```
AttachCopyToView( <Object>, <View 0|1|2> )
AttachCopyToView( <Object>, <View 0|1|2>, <Point 1>, <Point 2>, <Screen Point 1>, <Screen Point 2> )
```

**说明 / 示例：**

If View = 0, a copy of given object is created. For View = 1 or View = 2 this command creates a dependent copy  
of given object whose size in given  
Graphics View is constant.  
Let poly = Polygon((0, 0), (1, 0), (1, 1), (0, 1)). If Graphics View 1 is active, AttachCopyToView(poly, 1)  
creates a square with the same size at the same position.  
Once the copy is created, four more arguments are added to the command definition.  
If View = 0, a copy of given object is created. For View = 1 or View = 2 this command creates a dependent copy of  
given object whose size in given  
Graphics View is transformed using the affine transform that maps Point 1 to a point whose  
screen coordinates (in pixels) are equal to Screen Point 1, and Point 2 to a point with screen coordinates equal to  
Screen Point 2.  
Let poly = Polygon((0, 0), (1, 0), (1, 1), (0, 1)). If Graphics View 1 is active,  
AttachCopyToView(poly, 1, (0, 0), (1, 1), (0, 0), (100, 100)) creates a 100px x 100px square in the top left  
corner of the Graphics View.  
All points of the object are copied, even if they lie outside the view.

### Button

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Button/>

**语法：**

```
Button( )
Button( <Caption> )
```

**说明 / 示例：**

Creates a new button.  
Creates a new button with given caption.  
Button("Ok") creates a button in the left upper corner of the Graphics View with the caption Ok.

### CenterView

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/CenterView/>

**语法：**

```
CenterView( <Center Point> )
```

**说明 / 示例：**

This command differs among variants of English:  
CenterView (US)  
CentreView (UK + Aus)  
Translates the  
Graphics View so that the specified point is in the center.  
CenterView((0, 0)) moves the origin to the center of the Graphics View.  
If multiple Graphics Views are open, the command applies to the active View.

### Checkbox

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Checkbox/>

**语法：**

```
Checkbox( )
Checkbox( <Caption> )
Checkbox( <List> )
Checkbox( <Caption>, <List> )
```

**说明 / 示例：**

Creates a checkbox.  
Creates a checkbox with given caption.  
Creates a checkbox which, when unchecked, hides listed objects.  
Let A and B be points. c = Checkbox({A,B}) creates checkbox c. When c is checked, A and B are visible,  
otherwise they are hidden.  
Creates checkbox with given caption which, when unchecked, hides listed objects.

### CopyFreeObject

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/CopyFreeObject/>

**语法：**

```
CopyFreeObject( <Object> )
```

**说明 / 示例：**

Creates a free copy of the object. Preserves all basic  
Object Properties and copy of Auxiliary  
Object is auxiliary as well.

### Delete

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Delete/>

**语法：**

```
Delete( <Object> )
```

**说明 / 示例：**

Deletes the object and all its dependent objects.  
Let P be a point, sli a slider, and seg=Segment(P, sli). The command Delete(sli) deletes the slider sli and the segment seg, but doesn’t delete point P from the construction, since the point does not depend on the slider sli.  
CAS Syntax  
Deletes the object and all its dependent objects in GeoGebra and removes any value assigned to the object in the CAS View.  
Let P be a point, sli a slider, and seg=Segment(P,sli). The command Delete(sli) deletes the slider sli and the segment seg, but doesn’t delete point P from the construction, since the point does not depend on the slider sli.  
See also Delete tool.

### Execute

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Execute/>

**语法：**

```
Execute( <List of Texts> )
Execute( <List of Texts>, <Parameter>, … , <Parameter> )
```

**说明 / 示例：**

The Execute command works only if the commands in the list are written in English (US), regardless the language chosen for your GeoGebra interface.  
Executes a list of commands entered as texts.  
Execute({"A=(1,1)","B=(3,3)","C = Midpoint(A, B)"}) creates points A, B and their midpoint C.  
Execute(Join({"f\_{1} = 1", "f\_{2} = 1"}, Sequence("f\_{"+(i + 2) + "} = f\_{" + (i+1) + "} + f\_{"+ i +"}", i, 1, 10)))  
creates the first 10 elements of the Fibonacci sequence.  
Use the placeholders %1, %2 and so on as arguments of the commands in the list. The placeholders will be respectively replaced with the parameters used in the Execute command. Up to 9 parameters can be specified. After the replacement, the resulting scripts will be executed.  
Execute({"Segment(%1,%2)","Midpoint(%1,%2)"}, A, B) creates the segment AB and its midpoint.  
If the quote symbol (") is not available in your keyboard, use the virtual keyboard of GeoGebra or the command UnicodeToLetter(34)

### ExportImage

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/ExportImage/>

**语法：**

```
ExportImage( <Property>, <Value>, <Property>, <Value>, … )
```

**说明 / 示例：**

Exports an image of the currently active view (or the view specified by the "view" parameter)  
The Properties used in the command syntax, listed in the following examples, need to be entered in English.  
The values related to the View that will be saved as image are:  
1 for Graphics View  
2 for Graphics View 2  
-1 for 3D  
View  
ExportImage("scale", 5)  
Shows a popup of the current view so that the user can right-click → Save Image As…  
ExportImage("filename", "image.png")  
Saves a file called "image.png" of the current view  
ExportImage("filename", "image.png", "view", 2)  
Saves a file called "image.png" of Graphics View 2  
ExportImage("filename", "image.png", "view", -1)  
Saves a file called "image.png" of View 3D Graphics  
ExportImage("filename", "image.png", "dpi", 300)  
Saves a file called "image.png" of the current view at 300 dpi (dots-per-inch)  
ExportImage("filename", "image.png", "scale", 2)  
Saves a file called "image.png" of the current view at scale 2 (ie twice nominal screen resolution)  
ExportImage("filename", "image.png", "scalecm", 2, "dpi", 600)  
Saves a file called "image.png" of the current view at 600 dpi at a scale 1 unit = 2 cm  
ExportImage("filename", "image.png", "width", 1000)  
Saves a file called "image.png" of the current view with width = 1000 pixels  
ExportImage("filename", "image.png", "height", 1000)  
Saves a file called "image.png" of the current view with height = 1000 pixels  
ExportImage("filename", "image.png", "transparent", true)  
Saves a transparent PNG file called "image.png"  
Setting the “transparent” property as false saves also background images.  
ExportImage("filename", "image.svg", "type", "svg")  
Saves a file called "image.svg" of the current view in SVG format  
ExportImage("filename", "image.gif", "type", "gif", "slider", a, "loop", true, "time", 200, "width", 400)  
Saves a looping animated GIF of the current view controlled by slider "a" with 200ms between frames. Keep the width and  
number of slider steps small  
ExportImage("filename", "image.gif", "type", "gif", "view", -1, "rotate", 360°, "slider", a, "loop", true, "time", 200)  
Saves a looping animated GIF of the current view controlled by slider "a" with 200ms between frames and rotates the view  
360° during the animation. Keep the size of the view and the number of steps small  
ExportImage("type", "pdf", "filename", "test.pdf")  
Creates a PDF of the current view (or a 2-page PDF if Graphics View 2 is open)  
ExportImage("type", "pdf", "filename", "test.pdf", "slider", n)  
Creates a multi-page PDF of the current view where each page corresponds to one step of the slider "n"  
pic1 = ExportImage("view", 2, "corner", A, "corner2", B)  
Creates a GeoGebra image of View 2 and puts it in the view with position defined by A and B  
In GeoGebra Classic 5 if there is no filename parameter the image will be copied to the Clipboard. In the Chrome  
browser you can specify "clipboard", true  
To crop an export, make the Points Export_1 and Export_2 to define the rectangle to crop (These also crop  
the exports from the menus eg File → Export Image)  
Some syntaxes aren’t supported in GeoGebra 5 Classic  
In Chrome, you can try the experimental syntax "type", "webm" to get a faster & smaller export than with  
animated GIFs  
For the 2D Graphics Views you can try this syntax to get a monochrome export "grayscale", true (PNG format only)  
For the 3D Graphics View, only bitmaps (eg png, gif) are supported. In GeoGebra Classic 5 you can try this to get a  
high-resolution output  
ExportImage("filename", "c:\Users<username>\AppData\image.png", "view", -1, "width", 2000). Change <username>  
to your Windows username

### GetTime

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/GetTime/>

**语法：**

```
GetTime()
GetTime() returns a list such as {647, 59, 39, 23, 28, 2, 2011, "February", "Monday", 2}.
GetTime( "<Format>" )
```

**说明 / 示例：**

Returns a list with the current time and date in this order:  
milliseconds, seconds, minutes, hours (0-23), date, month (1-12), year, month (as text), day (as text), day (1 =  
Sunday, 2 = Monday, etc)  
Creates a text using Format as a template replacing any of the following characters when prefixed by a backslash  
():  
d, D, j, l, N, S, w, z, W, F, m, M, n, t, L, Y, y, a, A, g, G, h, H, i, s, U - the explanation to these characters are  
here <http://php.net/manual/en/function.date.php>  
GetTime("The date is \l the \j\S of \F \Y") might give The date is Thursday the 5th of July 2012  
.

### HideLayer

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/HideLayer/>

**语法：**

```
HideLayer( <Number> )
```

**说明 / 示例：**

Makes all objects in given layer invisible. Does not override  
Conditional Visibility.

### InputBox

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/InputBox/>

**语法：**

```
InputBox( <Linked Object> )
```

**说明 / 示例：**

Create a new Input Box and associate a Linked Object with it.  
See also  
Input Box Tool.

### Pan

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Pan/>

**语法：**

```
Pan( <x>, <y> )
Pan( <x>, <y>, <z> )
```

**说明 / 示例：**

Shifts the active view by x pixels to the right and y pixels upwards.  
Shifts the active view by (x, y, z) pixels if it is a 3D View, or by (x, y) pixels if it is 2D View  
If multiple Graphics Views are visible, the command is applied to the active one.  
See also ZoomIn, ZoomOut,  
SetActiveView commands.

### ParseToFunction

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/ParseToFunction/>

**语法：**

```
ParseToFunction( <Text> )
ParseToFunction( <Function>, <Text> )
ParseToFunction( <Text>, <List of variables> )
```

**说明 / 示例：**

Parses the text containing the function definition and creates the corresponding function.  
ParseToFunction("x^2") creates the function f(x) = x2.  
ParseToFunction("t+2/t") creates the function f(t) = t + 2/t.  
Parses the string and stores the result to a function f, which must be defined and  
free before the command is used.  
Define f(x) = 3x² + 2 and text1 = "f(x) = 3x + 1". ParseToFunction(f, text1) returns f(x) = 3x +1.  
Parses the text containing the function definition and creates the corresponding function of the  
variables defined in the list.  
ParseToFunction("2u+3v",{"u", "v"}) creates the function a(u,v) = 2u + 3v.  
See also ParseToNumber command.

### ParseToNumber

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/ParseToNumber/>

**语法：**

```
ParseToNumber( <Number>, <Text> )
ParseToNumber( <Text> )
```

**说明 / 示例：**

Parses the text and stores the result to a number a, which must be defined and  
free before the command is used.  
Define a = 3 and text1 = "6". ParseToNumber(a, text1) returns a = 6.  
This is a scripting command which only sets the value of a number once. To  
convert a text text1 into a number which is updated dynamically, use FromBase(text1,10).  
Parses the text and stores the result to a number.  
ParseToNumber("1+2+5-pi") creates the number a = 4.86.  
See also ParseToFunction command.

### PlaySound

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/PlaySound/>

**语法：**

```
PlaySound( <URL> )
PlaySound( <Boolean Play> )
PlaySound( <Function>, <Min Value>, <Max Value> )
PlaySound( <Function>, <Min Value>, <Max Value>, <Sample Rate>, <Sample Depth> )
PlaySound( <Note>, <Duration>, <Instrument> ) (GeoGebra Classic 5 only)
```

**说明 / 示例：**

Plays an MP3 (.mp3) file  
PlaySound("<https://github.com/murkle/utils/raw/refs/heads/master/welcome-to-geogebra-markus.mp3>")  
PlaySound("#J2sQQfwQ") plays an .mp3 that has been uploaded to GeoGebra  
PlaySound("<https://drive.google.com/uc?id=0B7xCmZaU3oU2eXFNUzd6ZlZJS0U\&authuser=0\&export=download>") plays an  
.mp3 from Google Drive  
PlaySound("<https://www.dropbox.com/s/27skpv82odjp7ej/material-1264825.mp3?dl=1>") plays an .mp3 from DropBox  
To work on iOS (and also if you want immediate playback) then you can encode the .mp3 as an inline base64-encoded data:  
URL, see <https://www.geogebra.org/m/wztkqxuv> for an example. It must start with the exact string  
data:audio/mp3;base64, to work in GeoGebra Classic 5. You can use this utility to convert .MP3s into the syntax  
needed in GeoGebra <https://test.geogebra.org/~mike/utils/base64Encode.html>  
Pause or resume play (not MP3 files)  
PlaySound(true) = play, PlaySound(false) = pause.  
Plays a sound generated by Function, a time-valued function with range [-1,1]. The time units are seconds and the  
sound is played from time Min Value to Max Value. Sound is generated by 8-bit samples taken at a rate of 8000 samples  
per second.  
This plays a pure sine wave tone at 440 Hz (musical note A) for one second.  
PlaySound(sin(440 2Pi x), 0, 1)  
Plays a sound generated by Function, a time-valued function with range [-1,1]. The time units are seconds and the  
sound is played from time Min Value to Max Value. The sampling method is specified by "Sample Depth" and "Sample  
Rate".  
"Sample Rate" is the number of sample function values taken each second. Allowable values are 8000, 11025, 16000,  
22050, or 44100  
"Sample Depth" is the data size of a sample in bits. Allowable values are 8 and 16.  
Plays a MIDI note.  
Note is an integer from 0 to 127 that represents a musical note given by the table below. When note = 60 a Middle C  
is played.  
Duration is the time to play the note in seconds.  
Instrument is an integer that represents the synthesized instrument used to play the note. See  
technical  
specifications for possible instruments.  
Most instruments are supported, but there are differences between computer platforms.  
MIDI Notes  
Octave  
C=Do  
Do#  
D = Ré  
Ré#  
E = Mi  
F = Fa  
Fa#  
G = Sol  
Sol#  
A = La  
La#  
B = Si  
0  
0  
1  
2  
3  
4  
5  
6  
7  
8  
9  
10  
11  
1  
12  
13  
14  
15  
16  
17  
18  
19  
20  
21  
22  
23  
2  
24  
25  
26  
27  
28  
29  
30  
31  
32  
33  
34  
35  
3  
36  
37  
38  
39  
40  
41  
42  
43  
44  
45  
46  
47  
4  
48  
49  
50  
51  
52  
53  
54  
55  
56  
57  
58  
59  
5  
60  
61  
62  
63  
64  
65  
66  
67  
68  
69  
70  
71  
6  
72  
73  
74  
75  
76  
77  
78  
79  
80  
81  
82  
83  
7  
84  
85  
86  
87  
88  
89  
90  
91  
92  
93  
94  
95  
8  
96  
97  
98  
99  
100  
101  
102  
103  
104  
105  
106  
107  
9  
108  
109  
110  
111  
112  
113  
114  
115  
116  
117  
118  
119  
10  
120  
121  
122  
123  
124  
125  
126  
127

### ReadText

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/ReadText/>

**语法：**

```
ReadText( <Text> )
```

**说明 / 示例：**

This command allows authors to include information for visually impaired users, making their applets more  
accessible. To hear the output you need to install a screen reader such as  
NVDA or VoiceOver. Currently it is only supported in the online version of GeoGebra.  
Tells the screen reader to read given text immediately.

### Rename

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Rename/>

**语法：**

```
Rename( <Object>, <Name> )
```

**说明 / 示例：**

Sets the label of given object to the given name.  
Let c: x^2 + 2y^2 = 2. Rename(c, "ell") sets the label to ell.

### Repeat

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Repeat/>

**语法：**

```
Repeat( <Number>, <Scripting Command>, <Scripting Command>, … )
```

**说明 / 示例：**

Repeats the execution of scripting commands n times, where n is the given Number.  
Turtle().  
Click the "Play" button displayed at bottom left.  
Repeat(8, TurtleForward(turtle1, 1), TurtleRight(turtle1, 45°))  
The turtle moves and draws a regular octagon.

### RunClickScript

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/RunClickScript/>

**语法：**

```
RunClickScript( <Object> )
```

**说明 / 示例：**

Runs the click script associated with the Object (if it has one).  
Let A and B be points. The OnClick script for B is SetValue(B,(1,1)). Setting the OnClick script of A  
as RunClickScript(B), moves point B to (1,1) when point A is clicked.  
See also RunUpdateScript command.

### RunUpdateScript

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/RunUpdateScript/>

**语法：**

```
RunUpdateScript( <Object> )
```

**说明 / 示例：**

Runs the update script associated with the Object (if it has one).  
See also RunClickScript command.

### SelectObjects

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/SelectObjects/>

**语法：**

```
SelectObjects( )
SelectObjects( <Object>, <Object>, … )
```

**说明 / 示例：**

Deselects all selected objects.  
Deselects all objects and selects objects passed as parameters. All parameters must be  
labeled objects.  
Let A, B and C be points. SelectObjects(A, B, C) selects points A, B and C.  
The command SelectObjects(Midpoint(A, B)) has no effect, besides deselecting all selected objects.  
This command now cancels any drag that is in progress (useful in scripts).

### SetActiveView

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/SetActiveView/>

**语法：**

```
SetActiveView( <View> )
```

**说明 / 示例：**

Makes given View active.  
1 or "G" for Graphics View  
2 or "D" for Graphics View 2  
-1 or "T" for 3D Graphics View  
"A" for Algebra View  
"S" for Spreadsheet View  
"C" for CAS View  
See also ZoomIn, ZoomOut, Pan,  
SetPerspective commands.

### SetAxesRatio

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/SetAxesRatio/>

**语法：**

```
SetAxesRatio( <Number>, <Number> )
SetAxesRatio( <Number>, <Number>, <Number> )
```

**说明 / 示例：**

Changes the axes ratio of active  
Graphics View so that X units on x-axis correspond to the same  
number of pixels as Y units on y-axis and point (0,0) stays on its coordinates. If a unitary ratio is used, the  
related axis is fixed with the unit value, and the other one is adjusted as indicated.  
SetAxesRatio(1,2) fixes the x-axis and compresses the y-axis  
SetAxesRatio(2,1) fixes the y-axis and shrinks the x-axis.  
Similar to above syntax, works with 3D Graphics View.

### SetBackgroundColor

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/SetBackgroundColor/>

**语法：**

```
SetBackgroundColor( <Object>, <Red>, <Green>, <Blue> )
SetBackgroundColor( <Object>, <"Color"> )
SetBackgroundColor( <Red>, <Green>, <Blue> )
SetBackgroundColor( <"Color"> )
```

**说明 / 示例：**

This command differs among variants of English:  
SetBackgroundColor (US)  
SetBackgroundColour (UK + Aus)  
Changes the background color of given object. This is used for Texts and for objects in the Spreadsheet. The red,  
green and blue represent amount of corresponding color component, 0 being minimum and 1 maximum. Number t exceeding  
this interval is mapped to it using function (2\left|\frac{t}2-\mathrm round\left(\frac{t}2\right)\right|).  
Changes the background color of given object. This is used for Texts and for objects in the Spreadsheet. The color  
is entered as text, that may be:  
an English color name (see the list of colors). Some of them can be also used in national  
languages and are listed below.  
If you use this command in a GeoGebraScript, you must use the English color names  
an hexadecimal string of the type #AARRGGBB or #RRGGBB, where AA defines transparency (00 full transparency to FF  
full opacity), RR defines the red component, GG the green one and BB the blue one.  
SetBackgroundColor(text1, "#80FF0000") sets the background color of existing text1 as Red, with a 50%  
transparency.  
Changes the background color of the active Graphics View  
Changes the background color of the active Graphics View  
If you use this command in a GeoGebraScript, you must use the English color names  
Black  
Dark Gray  
Gray  
Dark Blue  
Blue  
Dark Green  
Green  
Maroon  
Crimson  
Red  
Magenta  
Indigo  
Purple  
Brown  
Orange  
Gold  
Lime  
Cyan  
Turquoise  
Light Blue  
Aqua  
Silver  
Light Gray  
Pink  
Violet  
Yellow  
Light Yellow  
Light Orange  
Light Violet  
Light Purple  
Light Green  
White

### SetCaption

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/SetCaption/>

**语法：**

```
SetCaption( <Object>, <Text> )
```

**说明 / 示例：**

Changes the caption of the given object. Text must be enclosed in double quotes  
".

### SetColor

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/SetColor/>

**语法：**

```
SetColor( <Object>, <Red>, <Green>, <Blue> )
SetColor( <Object>, <"Color"> )
```

**说明 / 示例：**

This command differs among variants of English:  
SetColor (US)  
SetColour (UK + Aus)  
Changes the color of given object. The red, green and blue represent amount of corresponding color component, 0 being  
minimum and 1 maximum. Number t exceeding this interval is mapped to it using function  
(2\left|\frac{t}2-\mathrm round\left(\frac{t}2\right)\right|).  
Changes the color of given object. The color is entered as text, that may be:  
an English color name (see the list of colors). Some of them can be also used in national  
languages and are listed below.  
If you use this command in a GeoGebraScript, you must use the English color names  
an hexadecimal string of the type #AARRGGBB or #RRGGBB, where AA defines transparency (01 full transparency to FF  
full opacity), RR defines the red component, GG the green one and BB the blue one.  
SetColor(text1, "#80FF0000") sets the color of existing text1 as red, with a 50% white transparency.  
Black  
Dark Gray  
Gray  
Dark Blue  
Blue  
Dark Green  
Green  
Maroon  
Crimson  
Red  
Magenta  
Indigo  
Purple  
Brown  
Orange  
Gold  
Lime  
Cyan  
Turquoise  
Light Blue  
Aqua  
Silver  
Light Gray  
Pink  
Violet  
Yellow  
Light Yellow  
Light Orange  
Light Violet  
Light Purple  
Light Green  
White

### SetConditionToShowObject

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/SetConditionToShowObject/>

**语法：**

```
SetConditionToShowObject( <Object>, <Condition> )
```

**说明 / 示例：**

Sets the condition to show given object.

### SetConstructionStep

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/SetConstructionStep/>

**语法：**

```
SetConstructionStep( <Number> )
```

**说明 / 示例：**

Changes the construction step to given value. You can use this command to create  
buttons that replace or enhance the Navigation Bar.

### SetCoords

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/SetCoords/>

**语法：**

```
SetCoords( <Object>, <x>, <y> )
SetCoords( <Object>, <x>, <y>, <z> )
```

**说明 / 示例：**

Sets the cartesian coordinates of free objects in a 2D View as the given coordinates. This command uses  
the coordinates values, not their definitions, therefore the object stays free.  
Sets the cartesian coordinates of free objects in the 3D View as the given coordinates. This command uses  
the coordinates values, not their definitions, therefore the object stays free.  
This also works for points on paths and in regions. The point will be moved to the closest possible position.  
This command works also for sliders, buttons, checkboxes, input Boxes and Images.  
If the option "Absolute Screen Position" is selected, then x, y and z are in screen pixels.

### SetDecoration

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/SetDecoration/>

**语法：**

```
SetDecoration( <Object>, <Number> )
SetDecoration(<Segment>, <Number>, <Number>)
```

**说明 / 示例：**

Sets the decoration of the given object (see also the Style tab in the Properties window of the object). The  
object must be an angle, a segment or a "fillable object". The second argument in the command is the numeric code of  
the decoration / fill-style, as described in the following table.  
Value  
Segment decoration  
Angle decoration  
Fill-style  
0  
Remove decoration  
Remove decoration  
Solid fill  
1  
One tick  
Two arcs  
Hatched  
2  
Two ticks  
Three arcs  
Cross-hatched  
3  
Three ticks  
One tick  
Chessboard  
4  
One arrow  
Two ticks  
Dotted  
5  
Two arrows  
Three ticks  
Honeycomb  
6  
Three arrows  
Clockwise arrow  
Brick  
7  
(None)  
Anticlockwise arrow  
Weave pattern  
Sets the aspect of the line start and end of a segment. In order to view the decoration, it’s necessary to hide the  
two points that define the vertices of the segment. The segment decoration can also be set in the Style tab of the  
Properties window of the segment. The first number used as command parameter defines the style of the line segment  
start, and the second number sets the style of the line segment end, as described in the following table.  
Value  
Decoration  
0  
No decoration  
1  
vertical bar  
2  
arrow  
3  
crow’s foot  
4  
filled arrow (white)  
5  
filled arrow (colour)  
6  
empty dot  
7  
filled dot  
8  
empty square  
9  
filled square  
10  
empty diamond  
11  
filled diamond

### SetDynamicColor

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/SetDynamicColor/>

**语法：**

```
SetDynamicColor( <Object>, <Red>, <Green>, <Blue> )
SetDynamicColor( <Object>, <Red>, <Green>, <Blue>, <Opacity> )
```

**说明 / 示例：**

This command differs among variants of English:  
SetDynamicColor (US)  
SetDynamicColour (UK + Aus)  
Sets the dynamic color of the object.  
Sets the dynamic color and opacity of the object.  
All numbers are on a scale from 0 (off/transparent) to 1 (on/opaque).

### SetFilling

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/SetFilling/>

**语法：**

```
SetFilling( <Object>, <Number> )
```

**说明 / 示例：**

Changes the opacity of given object. Number must be from interval [0,1], where 0 means transparent and 1 means 100%  
opaque. Other numbers are ignored.

### SetFixed

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/SetFixed/>

**语法：**

```
SetFixed( <Object>, <true | false> )
SetFixed( <Object>, <true | false>, <true | false> )
```

**说明 / 示例：**

Makes the object fixed (for true) or not fixed (for false).  
Makes the object fixed (for true) or not fixed (for false) and the second parameter  
determines "Selection Allowed"

### SetImage

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/SetImage/>

**语法：**

```
SetImage( <Object>, <Image> )
SetImage( <Object>, <Text> )
```

**说明 / 示例：**

Fills the given object with an image.  
The object needs to allow filling, e.g. polygons, closed conics, buttons…  
Fills the object with one of the GeoGebra’s predefined action images, identified by the texts listed below.  
SetImage(button1,"pause") shows the GeoGebra’s predefined  Pause icon on button1.  
The current version of the command supports only button objects. The names of the images (Text parameter) need  
to be enclosed in " ".  
GeoGebra’s predefined action images  
Text  
Image  
pause  
play  
stop  
replay  
skip_next  
skip_previous  
loop  
zoom_in  
zoom_out  
close  
arrow_up  
arrow_down  
arrow_forward  
arrow_back  
fast_forward  
fast_rewind  
zoom_to_fit  
center_view  
help  
settings

### SetLabelMode

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/SetLabelMode/>

**语法：**

```
SetLabelMode( <Object>, <Number> )
```

**说明 / 示例：**

Changes the label mode of the given object, according to the table below.  
Integers distinct from the ones listed in table are treated as 0.  
The default option for the object’s label is Name.  
For options 3 and 9, if the object’s Caption box is empty, the Name of the object is used as caption.  
Number  
Mode  
0  
Name  
1  
Name + Value  
2  
Value  
3  
Caption  
9  
Caption + Value

### SetLayer

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/SetLayer/>

**语法：**

```
SetLayer( <Object>, <Layer> )
```

**说明 / 示例：**

Sets the layer for given object, where number of the layer must be an integer between 0 and 9 included.

### SetLevelOfDetail

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/SetLevelOfDetail/>

**语法：**

```
SetLevelOfDetail( <Surface>, <Level of Detail> )
```

**说明 / 示例：**

Sets whether a surface is drawn quickly with less details (Level of Detail = 0) or slowly but more accurately (Level of Detail = 1).

### SetLineOpacity

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/SetLineOpacity/>

**语法：**

```
SetLineOpacity( <Object>, <Number> )
```

**说明 / 示例：**

Sets the line opacity for the given object to a number between 0 and 1.

### SetLineStyle

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/SetLineStyle/>

**语法：**

```
SetLineStyle( <Line>, <Number> )
```

**说明 / 示例：**

Changes the line style of given object according to following table (numbers out of range [0,4] are treated as 0).  
Number  
Style  
0  
Full  
1  
Dashed long  
2  
Dashed short  
3  
Dotted  
4  
Dash-dot

### SetLineThickness

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/SetLineThickness/>

**语法：**

```
SetLineThickness( <Object>, <Number> )
```

**说明 / 示例：**

Sets the line thickness for the given object to (\frac{N}2) pixels, where N is the given number.

### SetPerspective

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/SetPerspective/>

**语法：**

```
SetPerspective( <Text> )
```

**说明 / 示例：**

Changes the layout and visibility of Views. The text parameter is either the full description of the layout,  
description of a single view you want to change or ID of one of the standard perspectives.  
Full layout description  
To change the whole layout you can describe the view positions using an expression. Views are represented by variables  
(letters): the horizontal arrangement of Views is represented by the related letters juxtaposition, and their vertical  
arrangement by a division symbol /.  
Letter  
View  
A  
Algebra  
B  
Probability Calculator  
C  
CAS  
D  
Graphics  
2  
G  
Graphics  
L  
Construction Protocol  
P  
Properties  
R  
Data analysis (Desktop only)  
S  
Spreadsheet  
T  
3D Graphics  
SetPerspective("G") makes only the Graphics View visible  
SetPerspective("AGS") makes  
Algebra, Graphics and  
Spreadsheet View visible,  
aligned horizontally  
SetPerspective("S/G") makes Spreadsheet and Graphics View visible with Spreadsheet on top and Graphics View below  
SetPerspective("S/(GA)") is similar as above, the bottom part of the screen consists of  
Graphics View on the left and  
Algebra View on the right  
Single view change  
To open or close individual Views, add the symbols + or - before the View name (letter), respectively.  
In apps other than GeoGebra Classic (e.g. the Graphing Calculator) you can also use Tools and `Table`for the  
tools and table of values.  
SetPerspective("+D") adds Graphics View 2 to the currently displayed ones, on the right  
SetPerspective("-D") removes Graphics View 2 from the currently displayed ones  
SetPerspective("+Tools") opens the sidebar in Graphing Calculator and switches it to tools tab  
SetPerspective("+Table") opens the sidebar in Graphing Calculator and switches it to table of values  
SetPerspective("-Tools") closes the sidebar in Graphing Calculator, no matter which tab is selected  
Standard perspectives  
You may also use a text containing a single digit to use a predefined perspective:  
Text  
Perspective  
"1"  
Algebra And Graphics  
"2"  
Geometry  
"3"  
Spreadsheet  
"4"  
CAS  
"5"  
3D Graphics  
"6"  
Probability  
These roughly correspond to "AG", "G", "SG", "CG", "AT" and "B" respectively, but may also affect the display of  
Input Bar and content of Toolbar.  
See also SetActiveView command.

### SetPointSize

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/SetPointSize/>

**语法：**

```
SetPointSize( <Point>, <Number> )
SetPointSize( <Object>, <Number> )
```

**说明 / 示例：**

Changes the size of the given point to the given number.  
Changes the size of the vertices of an object. The object can be any 2D or 3D one with vertices, e.g. a polygon, a polyhedron, a net…  
The command is also applicable to lists of (unlabeled) points, e.g. if list={(1, 2), (3, 4)}, then SetPointSize(list,5) changes the size of the listed points.

### SetPointStyle

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/SetPointStyle/>

**语法：**

```
SetPointStyle( <Point>, <Number> )
```

**说明 / 示例：**

Changes the point style of given point according to following table (numbers out of range [0,10] will be treated as 0).  
Number  
Style  
Symbol  
0  
Full dot  
1  
Cross  
⨯  
2  
Empty dot  
○  
3  
Plus sign  
\+  
4  
Full diamond  
◆  
5  
Empty diamond  
◇  
6  
Triangle north  
▲  
7  
Triangle south  
▼  
8  
Triangle east  
▶  
9  
Triangle west  
◀  
10  
Full dot (but with no outline)

### SetSeed

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/SetSeed/>

**语法：**

```
SetSeed( <Integer> )
```

**说明 / 示例：**

Seeds the random number generator so that subsequent random numbers will be determined by the seed.  
SetSeed(33)  
See also RandomBetween command, RandomElement  
command, RandomBinomial command, RandomNormal  
command, RandomPoisson command, RandomUniform  
command.

### SetSpinSpeed

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/SetSpinSpeed/>

**语法：**

```
SetSpinSpeed( <Number> )
```

**说明 / 示例：**

Sets the rotational speed of 3D view about the axis currently displayed in vertical  
position. The sign and value of the entered Number define the rotation as follows:  
if Number is greater than 1, then the 3D view rotates counter clockwise.  
if Number is less than -1, then the 3D view rotates clockwise.  
if Number is between -1 and 1 then the rotation will be cancelled.

### SetTooltipMode

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/SetTooltipMode/>

**语法：**

```
SetTooltipMode( <Object>, <Number> )
```

**说明 / 示例：**

Changes the tooltip mode for given object according to following table (values out of range [0,4]  
are treated as 0):  
Number  
Mode  
0  
Automatic  
1  
On  
2  
Off  
3  
Caption  
4  
Next cell

### SetTrace

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/SetTrace/>

**语法：**

```
SetTrace( <Object>, <true | false> )
```

**说明 / 示例：**

Turns Tracing on/off for the specified object.  
Create a point A, then type in SetTrace(A,true). Select the Move Tool and drag the point, to show its trace.  
Use ZoomIn(1) to clear all traces.

### SetValue

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/SetValue/>

**语法：**

```
SetValue( <Boolean>, <0|1> )
SetValue( <Object>, <Object> )
SetValue( <List>, <Number>, <Object> )
SetValue( <drop-down list>, <Number n > )
```

**说明 / 示例：**

Sets the state of a boolean / check box : 1 = true, 0 = false  
If b is a boolean, SetValue(b,1) sets the boolean b as true.  
Let A be the first and B the second object. If A is a free  
object or a Point restricted to Path or Region, its  
value is set to current value of B (i.e. A doesn’t change value if B is changed afterwards).  
If f is a function, SetValue(f, RandomElement({cos(x), 3x+2, ln(x)})) defines, at random, f as being one of the  
functions proposed in the list.  
Let n be the <Number>. The command SetValue sets the n-th element of a free list to the current value of the  
object. Number n can be at most 1 + length of L.  
SetValue( <Dependent Object>, ? )  
This is a special syntax that will set a dependent object to undefined without needing to fully redefine it using  
=.  
Set n as the index of the selected element in the drop-down list.

### SetViewDirection

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/SetViewDirection/>

**语法：**

```
SetViewDirection( <Direction> )
SetViewDirection( )
SetViewDirection()
SetViewDirection( <Direction>, <Boolean animated> )
```

**说明 / 示例：**

Sets the direction of the 3D view orientation depending on the given object.  
SetViewDirection(Vector((0, 0, 1)))  
SetViewDirection((0, 0, 1))  
SetViewDirection(x + y + z = 1)  
Sets the direction of the 3D view orientation to the default position.  
Sets the direction of the 3D view orientation depending on the given object, with optional animation.  
In order to obtain the rotation of the 3D view, depending on the values of a previously created slider α, use the  
command SetViewDirection(Vector((1; α; -30°)), false) in the OnUpdate scripting tab of slider α.  
The view direction can be set towards a line, segment, plane, etc.  
If you do eg SetViewDirection(x + y + z = 1) twice then there are two possible outcomes and the second one  
will rotate the view 180°. To avoid ambiguity use eg SetViewDirection(Vector((0, 0, 1)))  
See also  
View in front of tool.

### SetVisibleInView

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/SetVisibleInView/>

**语法：**

```
SetVisibleInView( <Object>, <View Number 1|2|-1>, <Boolean> )
```

**说明 / 示例：**

Makes object visible or hidden in given Graphics View. Use -1 for the 3D View  
You can also use these special object names: xAxis, yAxis, zAxis, xOyPlane

### ShowAxes

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/ShowAxes/>

**语法：**

```
ShowAxes( )
ShowAxes( <Boolean> )
ShowAxes( <View>, <Boolean> )
```

**说明 / 示例：**

Shows the axes in the active View.  
Shows/hides the axes in the active View.  
ShowAxes(true) shows the axes in the active View.  
ShowAxes(false) hides the axes in the active View.  
Shows/hides the axes in the Graphics  
View specified by the number 1 or 2 (or 3 for 3D View) .  
ShowAxes(1, true) shows the axes in Graphics View.  
ShowAxes(2, false) hides the axes in Graphics 2 View.  
See also ShowGrid command. To show / hide a single axis please use  
SetVisibleInView Command.

### ShowGrid

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/ShowGrid/>

**语法：**

```
ShowGrid( )
ShowGrid( <Boolean> )
ShowGrid( <View>, <Boolean> )
```

**说明 / 示例：**

Shows the grid in the active View.  
Shows/hides the grid in the active View.  
ShowGrid(true) shows the grid in the active View.  
ShowGrid(false) hides the grid in the active View.  
Shows/hides the grid in the Graphics  
View specified by the number 1 or 2 (or 3 for 3D View).  
ShowGrid(1, true) shows the grid in Graphics View.  
ShowGrid(2, false) hides the grid in Graphics 2 View.  
See also ShowAxes command.

### ShowLabel

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/ShowLabel/>

**语法：**

```
ShowLabel( <Object>, <Boolean> )
```

**说明 / 示例：**

Shows or hides the label in the  
Graphics View for the given object.  
Let f(x) = x^2. ShowLabel(f, true) shows the label of the function.

### ShowLayer

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/ShowLayer/>

**语法：**

```
ShowLayer( <Number> )
```

**说明 / 示例：**

Makes all objects in given layer visible. Does not override  
Conditional Visibility.  
ShowLayer(2) makes all objects in the second layer visible.

### Slider

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Slider/>

**语法：**

```
Slider( <Min>, <Max>, <Increment>, <Speed>, <Width>,<Is Angle>, <Horizontal>, <Animating>, <Boolean Random>)
```

**说明 / 示例：**

Creates a slider. The parameters settings can be as follows:  
Min, Max: set the range of the slider - These parameters are compulsory.  
Increment: set the increment of the slider’s value - default: 0.1  
Speed: set the slider speed during animations - default: 1  
Width: sets the slider width in pixels - default: 100  
Is Angle: sets if the slider is related to an angle. This parameter can be true or false - default: false  
Horizontal: sets whether the slider is shown as an horizontal (true) or vertical (false) segment - default:  
true  
Animating: sets the automatic animation of the slider - default: false  
Random: sets if the slider assumes continuous values in the [Min, Max] range (false), or random values in the  
same interval (true) - default: false  
See also the Slider tool.

### StartAnimation

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/StartAnimation/>

**语法：**

```
StartAnimation( )
StartAnimation( <Boolean> )
```

**说明 / 示例：**

Resumes all animations if they are paused.  
When the boolean is false, pauses all animations, otherwise resumes them.  
StartAnimation( <Point or Slider>, <Point or Slider>, …. )  
Starts animating given points and sliders, the points must be on paths.  
StartAnimation( <Point or Slider>, <Point or Slider>, …., <Boolean> )  
Starts (for boolean = true) or permanently stops (for boolean = false) animating given points and sliders, the points  
must be on paths.  
See also Animation.

### StartRecord

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/StartRecord/>

**语法：**

```
StartRecord( )
StartRecord( <Boolean> )
```

**说明 / 示例：**

Resumes all recording to spreadsheet if paused (and stores a value for each object).  
When the boolean is false, pauses all recording to the spreadsheet, otherwise resumes it (and stores a value for each  
object).

### Turtle

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Turtle/>

**语法：**

```
Turtle()
```

**说明 / 示例：**

Creates a turtle at the coordinate origin.  
See also TurtleForward, TurtleBack,  
TurtleLeft, TurtleRight,  
TurtleUp and TurtleDown commands.

### TurtleBack

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/TurtleBack/>

**语法：**

```
TurtleBack( <Turtle>, <Distance> )
```

**说明 / 示例：**

The turtle moves back with given distance.  
If the turtle is at the origin of the coordinates and the  
Pause button is displayed the command TurtleBack(turtle, 2) moves the turtle to the point (-2, 0). Otherwise you  
must press the Play button so that the displacement is  
effected.  
See also Turtle, TurtleForward,  
TurtleLeft and TurtleRight commands.

### TurtleDown

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/TurtleDown/>

**语法：**

```
TurtleDown( <Turtle> )
```

**说明 / 示例：**

Authorizes the turtle named to trace its movement from now.  
See also command TurtleUp

### TurtleForward

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/TurtleForward/>

**语法：**

```
TurtleForward( <Turtle>, <Distance> )
```

**说明 / 示例：**

The turtle moves forward with given distance.  
If the turtle is at the origin of the coordinates and the  
Pause button is displayed the command TurtleForward(turtle, 2) moves the turtle to the point (2, 0). Otherwise  
you must press the Play button so that the displacement is  
effected.  
See also Turtle, TurtleBack,  
TurtleLeft and TurtleRight commands.

### TurtleLeft

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/TurtleLeft/>

**语法：**

```
TurtleLeft( <Turtle>, <Angle> )
```

**说明 / 示例：**

The turtle turns to the left by a given angle.  
TurtleLeft(turtle, 1) turns the turtle to the left by 1 rad, if Pause button is displayed. Otherwise you must press the Play button so that the rotation is effected.  
If you enter TurtleLeft(turtle, 1°) the turtle turns to the left by 1 degree.  
See also Turtle, TurtleBack,  
TurtleForward and TurtleRight commands.

### TurtleRight

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/TurtleRight/>

**语法：**

```
TurtleRight( <Turtle>, <Angle> )
```

**说明 / 示例：**

The turtle turns to the right by a given angle.  
TurtleRight(turtle, 1) turns the turtle to the right by 1 rad, if Pause button is displayed. Otherwise you must press the Play button so that the rotation is effected.  
If you enter TurtleRight(turtle, 1°) the turtle turns to the right by 1 degree.  
See also Turtle, TurtleBack,  
TurtleForward and TurtleLeft commands.

### TurtleUp

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/TurtleUp/>

**语法：**

```
TurtleUp( <Turtle> )
```

**说明 / 示例：**

Instructs the named turtle not trace its movement from now.  
See also command TurtleDown

### UpdateConstruction

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/UpdateConstruction/>

**语法：**

```
UpdateConstruction( )
UpdateConstruction( <Number of times> )
```

**说明 / 示例：**

Recomputes all objects (random numbers are regenerated). Same as F9 or Ctrl + R.  
Use ZoomIn(1) (which is the same as Ctrl + F) to just refresh the view while keeping the current randomization. Refreshing removes traces from the  
Graphics  
View. If you are using more Graphic Views, use the SetActiveView command first to activate the View to refresh.  
Performs the command UpdateConstruction() several times.  
UpdateConstruction(2) updates the construction twice (e.g. to record several dice throws to the spreadsheet).

### ZoomIn

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/ZoomIn/>

**语法：**

```
ZoomIn( )
ZoomIn( <Scale Factor> )
ZoomIn( <Scale Factor>, <Center Point> )
ZoomIn( <Min x>, <Min y>, <Max x>, <Max y> )
ZoomIn( <Min x>, <Min y>, <Min z>, <Max x>, <Max y>, <Max z> )
```

**说明 / 示例：**

Restores the  
Graphics View to the default initial position  
Zooms the  
Graphics View in by given factor with respect to current zoom, center of the screen is used  
as center point for the zoom.  
ZoomIn(1) doesn’t change the view, but does remove traces  
ZoomIn(2) zooms the view in  
ZoomIn(0.5) is equivalent to ZoomOut(2), i.e. it zooms the view out.  
Zooms the  
Graphics View in by given factor with respect to current zoom, second parameter specifies  
center point for the zoom.  
ZoomIn(2, (0, 0))  
Zooms the graphics view to the rectangle given by vertices (Min x, Min y), (Max x, Max y).  
ZoomIn(0, 1, 5, 6)  
If any of these parameters are dependent or has label set, the bounds of the view become dynamic. To avoid this  
behavior, use CopyFreeObject Command.  
If a is a slider, ZoomIn(-a, -a, a, a) makes the zoom of the view dependent on slider a.  
Zooms the 3D graphics view to the cuboid given by vertices (Min x, Min y, Min z), (Max x, Max y, Max z).  
ZoomIn(-5, -5, -5, 5, 5, 5)  
The dynamic behavior of the 2D version isn’t supported  
If multiple  
Graphics Views are present, the active one is used  
See also ZoomOut, SetActiveView,  
Pan commands.

### ZoomOut

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/ZoomOut/>

**语法：**

```
ZoomOut( <Scale Factor> )
ZoomOut( <Scale Factor>, <Center Point> )
```

**说明 / 示例：**

Zooms the  
Graphics View out by given factor with respect to current zoom, center of the screen is used  
as center point for the zoom.  
ZoomOut(2) zooms the view out.  
Zooms the  
Graphics View out by given factor with respect to current zoom, second parameter specifies  
center point for the zoom.  
ZoomOut(2, (0, 0))  
ZoomOut(t) and ZoomOut(t, A) are equivalent to ZoomIn(1/t) and ZoomIn(1/t, A) respectively.  
If multiple Graphics Views are present, the active one is used.  
See also ZoomIn, SetActiveView,  
Pan commands.

## 表格命令

> 共 8 个命令

### Cell

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Cell/>

**语法：**

```
Cell( <Column>, <Row> )
```

**说明 / 示例：**

Returns copy of spreadsheet cell in given column and row.  
Cell(2, 1) returns copy of B1.  
By default the cells in spreadsheet cells are auxiliary and in such  
case this command returns auxiliary object as well.  
You must make sure that the cells you refer to are earlier in the  
Construction Protocol than this command.

### CellRange

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/CellRange/>

**语法：**

```
CellRange( <Start Cell>, <End Cell> )
```

**说明 / 示例：**

Creates a list containing the cell values in this cell range.  
Let A1 = 1, A2 = 4, A3 = 9 be spreadsheet cells values.Then  
CellRange(A1, A3) returns the list {1, 4, 9}.  
A1:A3 is a shorter syntax.

### Column

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Column/>

**语法：**

```
Column( <Spreadsheet Cell> )
```

**说明 / 示例：**

Returns the column of the cell as a number (starting at 1).  
q = Column(B3) returns q = 2 since column B is the second column of the  
spreadsheet.

### ColumnName

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/ColumnName/>

**语法：**

```
ColumnName( <Spreadsheet Cell> )
```

**说明 / 示例：**

Returns the column name of the cell as a text.  
r = ColumnName(A1) creates r = A and shows such text - A - in the Graphics View.

### FillCells

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/FillCells/>

**语法：**

```
FillCells( <CellRange>, <Object> )
FillCells( <Cell>, <List> )
FillCells( <Cell>, <Matrix> )
```

**说明 / 示例：**

Copies the value/equation etc. of the object to the given cellrange. Resulting cells are  
free objects, i.e. independent of object.  
CellRange has to be entered like this: e.g.: B2:D5.  
Object can be anything, e.g.: 3, RandomBetween(0, 10), Circle(A, B).  
Cells are labelled by column and row, e.g.: B2.  
Copies values from the list to the first cells on the right of the given cell. Resulting cells are ([Free, Dependent  
and Auxiliary Objects|free objects)], i.e. independent of the list.  
Copies values from the matrix into the spreadsheet. The upper left corner of the matrix is matched to the given cell.  
Resulting cells are free objects, i.e. independent of the matrix.  
See also FillRow and FillColumn commands.  
You can use FillCell(cell, Transpose({list})) to fill vertically. The extra braces convert the list into a matrix  
thus {list}

### FillColumn

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/FillColumn/>

**语法：**

```
FillColumn( <Column>, <List> )
```

**说明 / 示例：**

Copies values from the list to the first cells of the column given by number (1 for A, 2 for B, etc.). Resulting cells  
are free objects, i.e. independent of the list.  
See also the FillRow and FillCells commands.

### FillRow

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/FillRow/>

**语法：**

```
FillRow( <Row>, <List> )
```

**说明 / 示例：**

Copies values from the list to the first cells of the row given by number. Resulting cells are free objects, i.e.  
independent of the list.  
See also the FillColumn and FillCells commands.

### Row

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Row/>

**语法：**

```
Row( <Spreadsheet Cell> )
```

**说明 / 示例：**

Returns the row number of the spreadsheet cell (starting at 1).  
r = Row(B3) yields r = 3.

## 统计命令

> 共 69 个命令

### ANOVA

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/ANOVA/>

**语法：**

```
ANOVA( <List>, <List>, …)
```

**说明 / 示例：**

Performs a one-way ANOVA test on the given lists of numbers.  
Results are returned in list form as {P value, F test statistic}.

### ChiSquaredTest

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/ChiSquaredTest/>

**语法：**

```
ChiSquaredTest( <Matrix> )
ChiSquaredTest( <Observed List>, <Expected List> )
ChiSquaredTest( <Observed Matrix>, <Expected Matrix> )
ChiSquaredTest( <List>, <List>, <Degrees of Freedom> )
```

**说明 / 示例：**

Performs a chi-squared test that compares the given matrix of observed  
counts against the matrix of expected counts determined by the hypothesis of independence.  
The matrix of expected counts is calculated internally. Each expected count is found from the row and column totals of  
the given matrix of observed counts using the rule:  
( \text{expected count} = \frac{\text{row total} × \text{column total}}{\text{total observed counts}} )  
Results are returned in list form as {Probability value, chi-squared test statistic}.  
ChiSquaredTest({{1, 2, 1}, {3, 2, 3}}) yields {0.69, 0.75}.  
Performs a Goodness of Fit test that compares the given list of observed  
counts against the given list of expected counts. To compute the probability, n-1 degrees of freedom are assumed,  
where n is the number of elements in each list. For lists of different sizes the result is undefined.  
Results are returned in list form as {Probability value, chi-squared test statistic}.  
ChiSquaredTest({1, 2, 3, 4}, {3, 2, 4, 2}) yields {0.31, 3.58}.  
Performs a chi-squared test that compares the given matrix of observed  
counts against the given matrix of expected counts. To compute the probability, ((r-1)\cdot(c-1)) degrees of freedom are assumed,  
where r and c are the number of rows and columns in each matrix. For matrices of different size the result is undefined.  
Results are returned in list form as {Probability value, chi-squared test statistic}.  
ChiSquaredTest({{1, 2, 1}, {3, 2, 3}}, {{2, 3, 2}, {4, 2, 3}}) yields {0.45, 1.58}.  
Performs a Goodness of Fit test that compares the given list of observed  
counts against the given list of expected counts, using a specific number of degrees of freedom.  
Results are returned in list form as {Probability value, chi-squared test statistic}.  
For lists of different sizes the result is undefined.  
ChiSquaredTest({1, 2, 3, 4}, {3, 2, 4, 2}, 2) yields {0.17, 3.58}.

### Classes

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Classes/>

**语法：**

```
Classes( <List of Data>, <Start>, <Width of Classes> )
Classes( <List of Data>, <Number of Classes> )
```

**说明 / 示例：**

Gives a list of class boundaries. The first boundary (min) is equal to Start, the last boundary (max) will be at  
least the maximum of the List and the boundaries will be equally spaced between min and max.  
Classes({0.1, 0.2, 0.4, 1.1}, 0, 1) gives {0, 1, 2}  
Gives a list of class boundaries. The first boundary (min) is equal to the minimum of the List, the last boundary  
(max) will be the maximum of the List and the boundaries will be equally spaced between min and max.  
Classes({1, 3, 5, 7, 8, 9, 10}, 3) gives {1, 4, 7, 10}  
By convention this uses the a ≤ x < b rule for each class except for the last class which is a ≤ x ≤ b

### ContingencyTable

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/ContingencyTable/>

**语法：**

```
ContingencyTable( <List of Text>, <List of Text> )
ContingencyTable( <List of Text>, <List of Text>, <Options> )
ContingencyTable( <List of Row Values>, <List of Column Values>, <Frequency Table> )
ContingencyTable( <List of Row Values>, <List of Column Values> <Frequency Table>, <Options> )
```

**说明 / 示例：**

Draws a Contingency Table created from the two given lists. Unique  
values from the first list are used as row values in the table. Unique values from the second list are used as column  
values in the table.  
Draws a Contingency Table created from the two given lists as  
described above. The text Options controls the display of optional calculations within the table.  
Possible values for Options are "|", "*", "+", "e", "k", "=".  
"|" = show column percentages  
"*" = show row percentages  
"+" = show total percentages  
"e" = show expected counts  
"k" = show Chi Squared contributions  
"=" = show results of a Chi Squared test  
Draws a Contingency Table using the given list of row values, column  
values and corresponding frequency table.  
ContingencyTable({"Males","Females"},{"Right-handed", "Left-handed"},{{43,9},{44,4}}) yields the corresponding  
Contingency Table.  
Draws a Contingency Table using the given list of row values, column  
values and corresponding frequency table. The text Options controls the display of optional calculations within the  
table as described above.  
ContingencyTable({"Males","Females"},{"Right-handed", "Left-handed"},{{43,9},{44,4}},"\_") yields the corresponding  
Contingency Table showing the row percentages.

### CorrelationCoefficient

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/CorrelationCoefficient/>

**语法：**

```
CorrelationCoefficient( <List of x-coordinates>, <List of y-coordinates> )
CorrelationCoefficient( <List of Points> )
```

**说明 / 示例：**

Calculates the product moment correlation coefficient using the given x- and y-coordinates.  
CorrelationCoefficient({1, 3, 2, 1, 5, 2}, {1, 6, 4, 3, 3, 2}) yields 0.36.  
Calculates the product moment correlation coefficient using the coordinates of the given points.  
CorrelationCoefficient({(1, 1), (3, 6), (2, 4), (1, 3), (5, 3), (2, 2)}) yields 0.36.

### Covariance

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Covariance/>

**语法：**

```
Covariance( <List of Numbers>, <List of Numbers> )
Covariance( <List of Points> )
```

**说明 / 示例：**

Calculates the covariance between the elements of the specified lists.  
Covariance({1, 2, 3}, {1, 3, 7}) yields 2, the covariance of {1, 2, 3} and {1, 3, 7}.  
Calculates the covariance between the x and y coordinates of the specified points.  
Covariance({(1, 1), (2, 3), (3, 7)}) yields 2, the covariance of {1, 2, 3} and {1, 3, 7}.

### Fit

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Fit/>

**语法：**

```
Fit( <List of Points>, <List of Functions> )
Fit( <List of points>, <Function> )
```

**说明 / 示例：**

Returns a linear combination of the functions that best fit the points in the list.  
Fit({(-2, 3), (0, 1), (2, 1), (2, 3)}, {x^2, x}) yields 0.625 x^2 - 0.25x.  
Let L = {A, B, C, …}, f(x) = 1, g(x) = x, h(x) = e^x, F = {f, g, h}. Fit(L, F) calculates a  
function of the form a + b x + c e^x that fits the points in the list.  
Returns a function that fits the points in the list with minimum squared error with respect to the specified model. The given model function must depend on one or more  
sliders, that are taken as start values of parameters to be optimized. The non-linear iteration might not converge,  
but adjusting the sliders to a better starting point might help.  
Let a be slider with interval from -5 to 5 and increment 1. Fit({(-2, 3), (0, 1), (2, 1), (2, 3)}, a + x^2)  
yields -1 + x^2.  
See also FitExp, FitGrowth,  
FitLine, FitLineX, FitLog,  
FitLogistic, FitPoly, FitPow  
and FitSin  
If you work with big/small numbers, you should consider normalizing them for a more accurate result, see  
Normalize Command.

### FitExp

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/FitExp/>

**语法：**

```
FitExp( <List of Points> )
```

**说明 / 示例：**

Calculates the exponential regression curve in the form aℯbx.  
FitExp({(0, 1), (2, 3), (4, 3), (6, 4)}) yields 1.31ℯ0.21x.  
If you want the answer in the form ( a b ^ x ) then use the FitGrowth Command.  
You can do a direct least-squares fitting with Fit(list, a*exp(b*x))  
Euler’s number ℯ can be obtained by pressing ALT + e.  
See also Fit, FitGrowth, FitLine,  
FitLineX, FitLog,  
FitLogistic, FitPoly, FitPow  
and FitSin.

### FitGrowth

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/FitGrowth/>

**语法：**

```
FitGrowth( <List of Points> )
```

**说明 / 示例：**

Calculates a function of the form ( a b ^ x ) to the points in the list. (Very similar to  
FitExp[ <List of Points> ], just in a slightly different form).  
FitGrowth({(0, 1), (2, 3), (4, 3), (6, 4)}) yields 1.31 ( \cdot ) 1.23x.  
You can do a direct least-squares fitting with Fit(list, a*b^x)  
See also Fit, FitExp, FitLine,  
FitLineX, FitLog,  
FitLogistic, FitPoly, FitPow  
and FitSin

### FitImplicit

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/FitImplicit/>

**语法：**

```
FitImplicit( <List of Points>, <Order> )
```

**说明 / 示例：**

Attempts to find a best-fit implicit curve of order n ≥ 2 through the points. You need at least (\frac{n(n+3)}2)  
points.  
See also the ImplicitCurve, FitExp,  
FitGrowth, FitLine, FitLineX,  
FitLog, FitLogistic, FitPoly,  
FitPow and FitSin commands.

### FitLine

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/FitLine/>

**语法：**

```
FitLine( <List of Points> )
```

**说明 / 示例：**

Calculates the y on x regression line of the points.  
FitLine({(-2, 1), (1, 2), (2, 4), (4, 3), (5, 4)}) yields 0.4x + 2.  
CAS Syntax  
Calculates the y on x regression line of the points.  
FitLine({(-2, 1), (1, 2), (2, 4), (4, 3), (5, 4)}) yields 0.4x + 2.  
See also Best Fit  
Line tool and FitLineX Command  
If you work with big/small numbers, you should consider normalizing them for a more accurate result, see  
Normalize Command.

### FitLineX

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/FitLineX/>

**语法：**

```
FitLineX( <List of Points> )
```

**说明 / 示例：**

Calculates the x on y regression line of the points.  
FitLineX({(-1, 3), (2, 1), (3, 4), (5, 3), (6, 5)}) yields 1.1x - 0.1.  
CAS Syntax  
Calculates the x on y regression line of the points.  
FitLineX({(-1, 3), (2, 1), (3, 4), (5, 3), (6, 5)}) yields 1.1x - 0.1.  
See also Best Fit  
Line tool and FitLine Command  
If you work with big/small numbers, you should consider normalizing them for a more accurate result, see  
Normalize Command.

### FitLog

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/FitLog/>

**语法：**

```
FitLog( <List of Points> )
```

**说明 / 示例：**

Calculates the logarithmic regression curve.  
FitLog({(ℯ, 1), (ℯ^2, 4)}) yields -2 + 3 ln(x).  
CAS Syntax  
Calculates the logarithmic regression curve.  
FitLog({(ℯ, 1), (ℯ^2, 4)}) yields 3 ln(x) - 2.  
Euler’s number ℯ can be obtained by pressing ALT + e.  
See also FitExp Command, FitPoly Command,  
FitPow Command and FitSin Command.  
If you work with big/small numbers, you should consider normalizing them for a more accurate result, see  
Normalize Command.

### FitLogistic

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/FitLogistic/>

**语法：**

```
FitLogistic( <List of Points> )
```

**说明 / 示例：**

Calculates the regression curve in the form (\frac{a}{1+b e^{-kx}}).  
FitLogistic({(-6, 2), (0, 2), (3, 4), (3.4, 8)}) yields ( \frac{1.98}{1 - 0.03 e^{1x}}).  
The first and last data points should be fairly close to the curve. The list should have at least 3 points, preferably  
more. All points should have positive y-coordinates  
See also Fit, FitExp, FitGrowth,  
FitLine, FitLineX, FitLog,  
FitPoly, FitPow and FitSin.  
If you work with big/small numbers, you should consider normalizing them for a more accurate result, see  
Normalize Command.

### FitPoly

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/FitPoly/>

**语法：**

```
FitPoly( <List of Points>, <Degree of Polynomial> )
FitPoly( <Freehand Function>, <Degree of Polynomial> )
```

**说明 / 示例：**

Calculates the polynomial regression model of given degree that fits the specified points.  
FitPoly({(-1, -1), (0, 1), (1, 1), (2, 5)}, 3) yields f(x) = x3 - 1 x2 + 1.  
Calculates the polynomial regression model of given degree that fits a function drawn using the  
Freehand Shape Tool.  
To obtain a polynomial of degree n the list must contain at least n + 1 points.  
See also FitExp Command, FitLog Command,  
FitPow Command and FitSin Command.  
When working with big/small numbers, consider normalizing them for a more accurate result. See  
Normalize Command.  
CAS Syntax  
Calculates the polynomial regression model of given degree that fits the specified points.  
FitPoly({(-1, -1), (0, 1), (1, 1), (2, 5)}, 3) yields x3 - x2 + 1.

### FitPow

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/FitPow/>

**语法：**

```
FitPow( <List of Points> )
```

**说明 / 示例：**

Calculates the regression curve in the form a xb.  
FitPow({(1, 1), (3, 2), (7, 4)}) creates the regression curve f(x) = 0.97 x0.71.  
CAS Syntax  
Calculates the regression curve in the form a xb.  
FitPow({(1, 1), (3, 2), (7, 4)}) yields 0.97 x0.71.  
All points used need to be in the first quadrant of the coordinate system.  
See also FitExp Command, FitLog Command,  
FitPoly Command, and FitSin Command.  
If you work with big/small numbers, you should consider normalizing them for a more accurate result, see  
Normalize Command.

### FitSin

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/FitSin/>

**语法：**

```
FitSin( <List of Points> )
```

**说明 / 示例：**

Calculates the regression curve in the form a + b sin (c x + d).  
FitSin({(1, 1), (2, 2), (3, 1), (4, 0), (5, 1), (6, 2)}) yields f(x) = 1 + 1 sin (1.57 x - 1.57).  
The list should have at least four points, preferably more. The list should cover at least two extremal points. The  
first two local extremal points should not be too different from the absolute extremal points of the curve.  
See also FitExp Command, FitLog Command,  
FitPoly Command and FitPow Command.  
If you work with big/small numbers, you should consider normalizing them for a more accurate result, see  
Normalize Command.

### Frequency

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Frequency/>

**语法：**

```
Frequency( <List of Raw Data> )
Frequency( <Boolean Cumulative>, <List of Raw Data> )
Frequency( <List of Class Boundaries>, <List of Raw Data> )
Frequency( <List of Text>, <List of Text> )
Frequency( <Boolean Cumulative>, <List of Class Boundaries>,<List of Raw Data> )
Frequency( <List of Class Boundaries>, <List of Raw Data>, <Use Density> , <Density Scale Factor> (optional) )
Frequency( <Boolean Cumulative>, <List of Class Boundaries>, <List of Raw Data>, <Use Density> , <Density Scale Factor>(optional) )
```

**说明 / 示例：**

Returns a list with a count of the occurrences of each unique value in the given list of data. This input list can be  
numbers or text. The list is sorted in ascending order of the unique values. To get a list of the corresponding unique  
values use the Unique Command.  
Enter list1 = { "a", "a", "x", "x", "x", "b" }. Frequency(list1) returns the list { 2, 1, 3 }.  
Unique(list1) returns the list { "a", "b", "x" }.  
If Cumulative = false, returns the same list as Frequency( <List of Raw Data> )  
If Cumulative = true, returns a list of cumulative frequencies for Frequency( <List of Raw Data> ) .  
Enter list1 = { 0, 0, 0, 1, 1, 2 }. Frequency(true, list1) returns the list { 3, 5, 6 }.  
Frequency(false, list1) returns the list { 3, 2, 1}. Unique(list1) returns the list { 0, 1, 2 }.  
Returns a list of the counts of values from the given data list that lie within intervals of the form [a, b), where  
a and b are all the couples of consecutive numbers in the given class boundaries list. The highest interval has  
the form [a, b].  
Frequency({1, 2, 3}, {1, 1, 2, 3}) returns the list { 2, 2 }.  
Returns a contingency matrix containing counts of paired values from the two lists. The rows of the matrix correspond  
to the unique values in the first list, and the columns correspond to the unique values in the second list. To get a  
list of the unique values for each list use the command Unique Command.  
Let list1 = {"a", "b", "b", "c", "c", "c", "c"} and list2 = {"a", "b", "a", "a", "c", "c", "d"}. Then  
Frequency(list1, list2) returns the matrix (\begin{pmatrix} 1 & 0 & 0 & 0\ 1 &1 & 0 &0 \ 1 & 0 & 2 & 1 \  
\end{pmatrix})  
See also the ContingencyTable command.  
If Cumulative = false, returns the same list as Frequency( <List of Class Boundaries>, <List of Raw Data> )  
If Cumulative = true, returns a list of cumulative frequencies for Frequency( <List of Class Boundaries>, <List of  
Raw Data> )  
Returns a list of frequencies for the corresponding Histogram Command.  
If Use density = false, returns the same list as Frequency( <List of Class Boundaries>, <List of Raw Data> )  
If Use density = true, returns the list of frequencies of each class.  
Let data = {1, 2, 2, 2, 3, 3, 4, 4, 4, 4} be the list of raw data and classes={0, 2, 5} the list of class  
boundaries. Then Frequency(classes, data, false) and Frequency(classes, data) both return the list {1,  
9}, while Frequency(classes, data, true) returns the list {0.5, 3}.  
Returns a list of frequencies for the corresponding Histogram Command.

### FrequencyPolygon

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/FrequencyPolygon/>

**语法：**

```
FrequencyPolygon( <List of Class Boundaries>, <List of Heights> )
FrequencyPolygon( <List of Class Boundaries>, <List of Raw Data>, <Boolean Use Density>, <Density Scale Factor (optional)> )
FrequencyPolygon( <Boolean Cumulative>, <List of Class Boundaries>, <List of Raw Data>, <Boolean Use Density> , <Density Scale Factor (optional)> )
```

**说明 / 示例：**

Frequency polygon is a line graph drawn by joining all the midpoints of the top of the bars of a histogram. Therefore  
usage of this command is the same as usage of Histogram Command.  
Creates a frequency polygon with vertices in given heights. The class boundaries determine the x-coordinate of each  
vertex.  
FrequencyPolygon({0, 1, 2, 3, 4, 5}, {2, 6, 8, 3, 1}) creates the corresponding line graph.  
Creates a frequency polygon using the raw data. The class boundaries determine the x-coordinates of vertices and are  
used to determine how many data elements lie in each class. The y-coordinate of a vertex is determined as follows  
If Use Density = true, height = (Density Scale Factor) * (class frequency) / (class width)  
If Use Density = false, height = class frequency  
By default, Use Density = true and Density Scale Factor = 1.  
If Cumulative is true this creates a frequency polygon where each vertex y-coordinate equals the frequency of the  
class plus the sum of all previous frequencies.  
For further examples see Histogram Command.

### FrequencyTable

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/FrequencyTable/>

**语法：**

```
FrequencyTable( <List of Raw Data> )
FrequencyTable( <Boolean Cumulative>, <List of Raw Data> )
FrequencyTable( <List of Class Boundaries>, <List of Raw Data> )
FrequencyTable( <Boolean Cumulative>, <List of Class Boundaries>, <List of Raw Data> )
FrequencyTable( <List of Class Boundaries>, <List of Raw Data>, <Use Density> , <Density Scale Factor (optional)> )
FrequencyTable( <Boolean Cumulative>, <List of Class Boundaries>, <List of Raw Data>, <Use Density> , <Density Scale Factor (optional)> )
FrequencyTable( <List of Raw Data>,<Scale Factor (optional)> )
```

**说明 / 示例：**

Returns a table (as text) whose first column contains sorted list of unique elements of list L and second column  
contains the count of the occurrences of value in the first column. List L can be numbers or text.  
If Cumulative = false, returns the same table as Frequency( <List of Raw Data> )  
If Cumulative = true, returns a table whose first column is the same as in FrequencyTable( <List of Raw Data> ) and  
the second contains cumulative frequencies of values in the first column.  
Returns a table (as text) whose first column contains intervals (classes) and second column contains the count of  
numbers in List of Raw Data, which belong to the interval in the first column. All intervals except the highest  
interval are of the form [a, b). The highest interval has the form [a, b].  
If Cumulative = false, returns the same table as FrequencyTable( <List of Class Boundaries>, <List of Raw Data> )  
If Cumulative = true, returns a table whose first column is the same as in FrequencyTable( <List of Raw Data> ) and  
the second contains cumulative frequencies of values in the first column.  
Returns a table (as text) whose first column contains intervals (classes) and second contains frequencies for the  
corresponding Histogram Command.  
Returns a table (as text) whose first column contains intervals (classes) and second contains frequencies for the  
corresponding Histogram Command.  
Returns a table (as text) whose first column Value contains a sorted list of unique elements of the <List of Raw  
Data> and second column Frequency contains the count of the occurrences of value in the first column multiplied by  
the <Scale Factor>. The list can be numbers or text.  
FrequencyTable({"red", "red", "green", "green", "blue"}, 5) returns a table with first column Value with entries  
blue, green, red (alphabetical order) and second column Frequency with entries 5, 10, 10.  
FrequencyTable({1, 1, 1, 2, 2, 3, 3, 4, 5}, 2) returns a table with first column Value with entries 1, 2, 3, 4,  
5 and second column Frequency with entries 6, 4, 4, 2, 2.  
In the list there appears 1 three-times, so the count of the occurrences of 1 (=3) has to be multiplied by the scale  
factor 2 to get entry 6 in the second column.  
This command is similar to Frequency Command and Histogram  
Command. Articles about these commands contain some related examples.

### GeometricMean

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/GeometricMean/>

**语法：**

```
GeometricMean(List of Numbers)
```

**说明 / 示例：**

Returns the geometric mean of given list of numbers.  
GeometricMean({13, 7, 26, 5, 19}) yields 11.76.

### HarmonicMean

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/HarmonicMean/>

**语法：**

```
HarmonicMean( <List of Numbers> )
```

**说明 / 示例：**

Returns the harmonic mean of given list of numbers.  
HarmonicMean({13, 7, 26, 5, 19}) yields 9.79.

### MAD

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/MAD/>

**语法：**

```
MAD( <List of Numbers> )
MAD( <List of Numbers>, <List of Frequencies> )
```

**说明 / 示例：**

Calculates the Mean Absolute Deviation of the numbers in the  
list.  
MAD({1, 2, 3, 4, 5}) yields 1.2  
Calculates the weighted mean absolute deviation of the given numbers.  
MAD({20, 40, 41, 42, 40, 54}, {20, 6, 4, 5, 2}) yields 5.79  
See also SD Command.

### Max

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Max/>

**语法：**

```
Max( <List> )
Max( <Interval> )
Max( <Number>, <Number> )
Max( <Function>, <Start x-Value>, <End x-Value> )
Max(<List of Data>, <List of Frequencies> )
```

**说明 / 示例：**

Returns the maximum of the numbers within the list.  
Max({-2, 12, -23, 17, 15}) yields 17.  
If the input consists of non-numeric objects, then this command considers the numbers associated with those objects. If  
you have a list of segments for example, the command Max( <List> ) will yield the maximum segment length.  
Returns the upper bound of the interval.  
Max(2 < x < 3) yields 3.  
Open and closed intervals are treated the same.  
Returns the maximum of the two given numbers.  
Max(12, 15) yields 15.  
Calculates (numerically) the local maximum point of the function in the given interval. The function should be  
continuous, defined over its natural domain (i.e. no domain restrictions are applied), and have only one local maximum point in the interval (and no local minimum).  
Max(exp(x)x^2,-3,-1) creates the point (-2, 0.54134).  
For polynomials you should use the Extremum Command.  
Returns the maximum of the list of data with corresponding frequencies.  
Max({1, 2, 3, 4, 5}, {5, 3, 4, 2, 0}) yields 4, the highest number of the list whose frequency is greater than 0.  
If you want the maximum of two functions f(x) and g(x) then you can define  
(f(x) + g(x) + abs(f(x) - g(x)))/2  
See also Extremum Command, Min Command and  
Function Inspector Tool.  
CAS Syntax  
Unlike in the Algebra View, this syntax will give the maximum over the interval, including endpoints. The function should be  
continuous, defined over its natural domain (i.e. no domain restrictions are applied), and have only one local maximum point in the interval (and no local minimum).  
Max(x^2,-1,2) yields the point (2,4)  
Max(-x^2,-1,2) yields the point (0,0)

### Mean

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Mean/>

**语法：**

```
Mean( <List of Raw Data> )
Mean( <List of Numbers>, <List of Frequencies> )
```

**说明 / 示例：**

Calculates the arithmetic mean of list elements.  
Mean({1, 2, 3, 2, 4, 1, 3, 2}) yields a = 2.25 and  
Mean({1, 3, 5, 9, 13}) yields a = 6.2.  
Calculates the weighted mean of the list elements.  
Mean({1, 2, 3, 4}, {6, 1, 3, 6}) yields a = 2.56 and  
Mean({1, 2, 3, 4}, {1, 1, 3, 6}) yields a = 3.27.  
See also MeanX, MeanY, and SD commands.

### MeanX

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/MeanX/>

**语法：**

```
MeanX( <List of Points> )
```

**说明 / 示例：**

Calculates the mean of the x-coordinates of the points in the list.  
MeanX({(0,0), (3,2), (5,1), (2,1), (2,4)}) yields 2.4

### MeanY

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/MeanY/>

**语法：**

```
MeanY( <List of Points> )
```

**说明 / 示例：**

Calculates the mean of the y-coordinates of the points in the list.  
MeanY({(0,0), (3,2), (5,1), (2,1), (2,4)}) yields 1.6

### Median

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Median/>

**语法：**

```
Median( <List of Raw Data> )
Median( <List of Numbers>, <List of Frequencies> )
```

**说明 / 示例：**

Determines the median of the list elements.  
Median({1, 2, 3}) yields 2.  
Median({1, 1, 8, 8}) yields 4.5.  
Calculates the weighted median of the list elements.  
Median({1, 2, 3}, {4, 1, 3}) yields 1.5.  
Median({1, 2, 3, 4}, {6, 1, 3, 6}) yields 3.  
If the length of the given list is even, the arithmetic mean of the two center elements is returned.  
See also Mean command.

### Min

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Min/>

**语法：**

```
Min( <List> )
Min( <Interval> )
Min( <Number>, <Number> )
Min( <Function>, <Start x-Value>, <End x-Value> )
Min( <List of Data>, <List of Frequencies> )
```

**说明 / 示例：**

Returns the minimum of the numbers within the list.  
Min({-2, 12, -23, 17, 15}) yields -23.  
If the input consists of non-numeric objects, then this command considers the numbers associated with those objects. If  
you have a list of segments for example, the command Min( <List> ) will yield the minimum segment length.  
Returns the lower bound of the interval.  
Min(2 < x < 3) yields 2 .  
Open and closed intervals are not distinguished.  
Returns the minimum of the two given numbers.  
Min(12, 15) yields 12.  
Calculates (numerically) the local minimum point for function in the given interval. The function should be  
continuous, defined over its natural domain (i.e. no domain restrictions are applied), and have only one local minimum point in the interval (and no local maximum).  
Min(exp(x) x^3,-4,-2) creates the point (-3, -1.34425) .  
For polynomials you should use the Extremum Command.  
Returns the minimum of the list of data with corresponding frequencies.  
Min({1, 2, 3, 4, 5}, {0, 3, 4, 2, 3}) yields 2, the lowest number of the first list whose frequency is greater  
than 0.  
If you want the minimum of two functions f(x) and g(x) then you can define  
(f(x) + g(x) - abs(f(x) - g(x)))/2  
See also Max Command, Extremum Command and  
Function Inspector Tool.  
CAS Syntax  
Unlike in the Algebra View, this syntax will give the minimum over the interval, including endpoints. The function should be  
continuous, defined over its natural domain (i.e. no domain restrictions are applied), and have only one local minimum point in the interval (and no local maximum).  
Min(x^2,-1,2) yields the point (0,0)  
Min(-x^2,-1,2) yields the point (2,-4)

### Mode

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Mode/>

**语法：**

```
Mode( <List of Numbers> )
```

**说明 / 示例：**

Determines the mode(s) of the list elements.  
Mode({1, 2, 3, 4}) returns an empty list {}.  
Mode({1, 1, 1, 2, 3, 4}) returns the list {1} .  
Mode({1, 1, 2, 2, 3, 3, 4}) returns the list {1, 2, 3}.

### Normalize

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Normalize/>

**语法：**

```
Normalize( <List of Numbers> )
Normalize( <List of Points> )
```

**说明 / 示例：**

This command differs among variants of English:  
Normalize (US)  
Normalise (UK + Aus)  
Returns a list containing the normalized form of the given numbers.  
Normalize({1, 2, 3, 4, 5}) returns {0, 0.25, 0.5, 0.75, 1}.  
Returns a list containing the normalized form of the given points.  
Normalize({(1,5), (2,4), (3,3), (4,2), (5,1)}) returns {(0,1), (0.25,0.75), (0.5,0.5), (0.75,0.25), (1,0)}.  
If you are doing calculations using big or small numbers (eg using FitGrowth) then  
normalizing them might avoid rounding/overflow errors  
This command is not applicable to 3D points.  
The operation of normalization maps a value x to the interval [0, 1] using the linear function (x \rightarrow \frac{x-Min(list)}{Max(list)-Min(list)}).

### Percentile

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Percentile/>

**语法：**

```
Percentile( <List of Numbers>, <Percent> )
```

**说明 / 示例：**

Let P equal the given Percent.  
Returns the value that cuts off the first P percent of the list of numbers, when the list is sorted in ascending  
order. Percent must be a number in the interval 0 < P ≤ 1.  
Percentile({1, 2, 3, 4}, 0.25) yields 1.25.  
The commands Quartile and Percentile use different rules and do not always return matching  
results.  
Q1({1, 2, 3, 4}) yields 1.5 whereas Percentile({1, 2, 3, 4}, 0.25) yields 1.25.

### Product

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Product/>

**语法：**

```
Product( <List of Raw Data> )
Product( <List of Numbers>, <Number of Elements> )
Product( <List of Numbers>, <List of Frequencies> )
Product( <Expression>, <Variable>, <Start Value>, <End Value> )
Product( <List of Expressions> )
```

**说明 / 示例：**

Calculates the product of all numbers in the list.  
Product({2, 5, 8}) yields 80.  
Calculates the product of the first n elements in the list.  
Product({1, 2, 3, 4}, 3) yields 6.  
Calculates the product of all elements in the list of numbers raised to the value given in the list of frequencies  
for each one of them.  
Product({20, 40, 50, 60}, {4, 3, 2, 1}) yields 1536000000000000  
Product({sqrt(2), cbrt(3), sqrt(5), cbrt(-7)}, {4, 3, 2, 3}) yields -420  
The two lists must have the same length.  
Calculates the product of the expressions that are obtained by replacing the given variable with every integer from the given  
start to the given end values.  
Product(k, k, 1, 7) yields 5040  
Product(x + k, k, 2, 3) yields f(x)=(x + 2)(x + 3).  
CAS Syntax  
Calculates the product of all elements in the list.  
Product({1, 2, x}) yields 2x.  
Calculates the product of the expressions that are obtained by replacing the given variable with every integer from the given  
start to the given end values.  
Product(x + 1, x, 2, 3) yields 12.

### Quartile1

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Quartile1/>

**语法：**

```
Quartile1( <List of Raw Data> )
Quartile1( <List of Numbers>, <List of Frequencies> )
```

**说明 / 示例：**

Determines the lower quartile of the list elements.  
Quartile1({1, 2, 3, 4}) yields 1.5.  
Determines the lower quartile of the list elements considering the frequencies.  
Quartile1({1, 2, 3, 4}, {3, 2, 4, 2)) yields 1.  
GeoGebra uses the Moore & McCabe (2002) method to calculate quartiles, see <https://mathworld.wolfram.com/Quartile.html>

### Quartile3

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Quartile3/>

**语法：**

```
Quartile3( <List of Raw Data> )
Quartile3( <List of Numbers>, <List of Frequencies> )
```

**说明 / 示例：**

Determines the upper quartile of the list elements.  
Quartile3({1, 2, 3, 4}) yields 3.5.  
Determines the upper quartile of the list elements considering the frequencies.  
Quartile3({1, 2, 3, 4}, {3, 2, 4, 2}) yields 3.  
GeoGebra uses the Moore & McCabe (2002) method to calculate quartiles, see <https://mathworld.wolfram.com/Quartile.html>

### RSquare

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/RSquare/>

**语法：**

```
RSquare( <List of Points>, <Function> )
```

**说明 / 示例：**

Calculates the coefficient of determination R² = 1 -  
SSE / Syy, between the y-values of the points in the  
list and the function values of the x-values in the list.  
RSquare({(-3, 2), (-2, 1), (-1, 3), (0, 4), (1, 2), (2, 4), (3, 3), (4, 5), (6, 4)}, 0.5x + 2.5) yields 0.28.

### RootMeanSquare

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/RootMeanSquare/>

**语法：**

```
RootMeanSquare( <List of Numbers> )
```

**说明 / 示例：**

Returns the root mean square of given list of numbers.  
RootMeanSquare({3, 4, 5, 3, 2, 3, 4}) yields 3.5456.

### SD

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/SD/>

**语法：**

```
SD( <List of Raw Data> )
SD( <List of Numbers>, <List of Frequencies> )
```

**说明 / 示例：**

Calculates the standard deviation of the numbers in the list.  
This command has also the equivalent syntax stdevp( <List of Raw Data> ).  
SD({1, 2, 3, 4, 5}) yields 1.41  
stdevp({1, 2, 3, 4, 5}) yields 1.41  
Calculates the weighted standard deviation of the given numbers.  
This command has also the equivalent syntax stdevp( <List of Numbers>, <List of Frequencies> ).  
SD({1, 2, 3, 4, 5}, {5, 4, 3, 2, 1}) yields 1.25  
stdevp({1, 2, 3, 4, 5}, {5, 4, 3, 2, 1}) yields 1.25  
CAS Syntax  
Calculates the standard deviation of the numbers in the list.  
This command has also the equivalent syntax stdevp( <List of Raw Data> ).  
SD({1, 2, 3, 4, 5}) yields (\sqrt{2}).  
stdevp({1, 2, 3, 4, 5}) yields (\sqrt{2}).  
SD({-3 + 2 x, -1- 4 x, -2 + 5 x^2}) is evaluated as ( \sqrt{2}  
\frac{\sqrt{25x⁴ + 10x³ + 28x² - 18x + 3} } { 3 } ).  
Calculates the weighted standard deviation of the given numbers.  
This command has also the equivalent syntax stdevp( <List of Numbers>, <List of Frequencies> ).  
SD({1, 2, 3, 4, 5}, {5, 4, 3, 2, 1}) yields (\frac{\sqrt{14}}{3})  
stdevp({1, 2, 3, 4, 5}, {5, 4, 3, 2, 1}) yields (\frac{\sqrt{14}}{3})  
See also Mean Command.

### SDX

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/SDX/>

**语法：**

```
SDX( <List of Points> )
```

**说明 / 示例：**

Returns the standard deviation of the x-coordinates of the points in the given list.  
SDX({(1, 1), (2, 2), (3, 1), (3, 3), (4, 2), (3, -1)}) yields a = 0.94.

### SDY

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/SDY/>

**语法：**

```
SDY( <List of Points> )
```

**说明 / 示例：**

Returns the standard deviation of the y-coordinates of the points in the given list.  
SDY({(1, 1), (2, 2), (3, 1), (3, 3), (4, 2), (3, -1)}) yields a = 1.25.

### Sample

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Sample/>

**语法：**

```
Sample( <List>, <Size> )
Sample( <List>, <Size>, <With Replacement> )
```

**说明 / 示例：**

Returns list of n randomly chosen elements of a list; elements can be chosen several times.  
Sample({1, 2, 3, 4, 5}, 5) yields for example list1 = {1, 2, 1, 5, 4}.  
Returns list of n randomly chosen elements of a list. Elements can be chosen several times if and only if the last  
parameter is true.  
Sample({1, 2, 3, 4, 5}, 5, true) yields for example list1 = {2, 3, 3, 4, 5}.  
In the CAS View the input list can contain different types of objects:  
Sample({-5, 2, a, 7, c}, 3) yields for example {a, 7, -5}.  
The list can include lists as well: Let List1 be {1, 2, 3}: Sample({List1, 4, 5, 6, 7, 8}, 3, false) yields  
for example {6, {1, 2, 3}, 4}.

### SampleSD

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/SampleSD/>

**语法：**

```
SampleSD( <List of Raw Data> )
SampleSD( <List of Numbers>, <List of Frequencies> )
```

**说明 / 示例：**

Returns the sample standard deviation of the given  
list of numbers.  
This command has also the equivalent syntax stdev( <List of Raw Data> ).  
SampleSD({1, 2, 3}) yields 1.  
stdev({1, 2, 3}) yields 1.  
Returns the sample standard deviation of the numbers in the given list, having the specified frequencies.  
This command has also the equivalent syntax stdev( <List of Numbers>, <List of Frequencies> ).  
SampleSD({1, 2, 3, 4},{1, 1, 1, 2}) yields 1.3.  
stdev({1, 2, 3, 4},{1, 1, 1, 2}) yields 1.3.  
If the list contains undefined variables in the CAS View, the command yields  
a formula for the sample standard deviation.  
SampleSD({1, 2, a}) yields (\frac{\sqrt{a²-3a+3}}{\sqrt{3}}).

### SampleSDX

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/SampleSDX/>

**语法：**

```
SampleSDX( <List of Points> )
```

**说明 / 示例：**

Returns the sample standard deviation of the x-coordinates of the points in the given list.  
SampleSDX({(2, 3), (1, 5), (3, 6), (4, 2), (1, 1), (2, 5)}) yields a = 1.17.

### SampleSDY

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/SampleSDY/>

**语法：**

```
SampleSDY( <List of Points> )
```

**说明 / 示例：**

Returns the sample standard deviation of the y-coordinates of the points in the given list.  
SampleSDY({(2, 3), (1, 5), (3, 6), (4, 2), (1, 1), (2, 5)}) yields a = 1.97.

### SampleVariance

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/SampleVariance/>

**语法：**

```
SampleVariance( <List of Raw Data> )
SampleVariance( <List of Numbers>, <List of Frequencies> )
```

**说明 / 示例：**

Returns the sample variance of the given list of numbers.  
SampleVariance({1, 2, 3, 4, 5}) yields a = 2.5.  
Returns the sample variance of the given list of numbers with the specified frequencies.  
SampleVariance({1, 2, 3, 4, 5}, {3, 2, 4, 4, 1}) yields a = 1.67.  
If the list in the CAS View  
contains undefined variables, this command yields a formula for the sample variance.  
SampleVariance({a, b, c}) yields (\frac{1}{3} a^{2} - \frac{1}{3} ab - \frac{1}{3}ac + \frac{1}{3}  
b^{2} - \frac{1}{3} bc + \frac{1}{3} c^{2}).

### Shuffle

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Shuffle/>

**语法：**

```
Shuffle( <List> )
```

**说明 / 示例：**

Returns list with same elements, but in random order.  
You can recompute the list via Recompute all objects in  
View Menu (or pressing F9).  
See also RandomElement Command and RandomBetween  
Command.  
CAS Syntax  
Returns list with same elements, but in random order.  
Shuffle({3, 5, 1, 7, 3}) yields for example {5, 1, 3, 3, 7}.  
Shuffle(Sequence(20)) gives the first 20 whole numbers in a random order.

### SigmaXX

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/SigmaXX/>

**语法：**

```
SigmaXX( <List of Points> )
SigmaXX( <List of Raw Data> )
SigmaXX( <List of Numbers>, <List of Frequencies> )
```

**说明 / 示例：**

Calculates the sum of squares of the x-coordinates of the given points.  
Let list1 = {(-3, 4), (-1, 4), (-2, 3), (1, 3), (2, 2), (1, 5)} be a list of points. SigmaXX(list1) yields  
the value 20.  
Calculates the sum of squares of the given numbers.  
In order to work out the variance of a list you may use SigmaXX(list) / Length(list) - Mean(list)^2.  
Calculates the weighted sum of squares of the given numbers.  
Let list1 = {3, 2, 4, 3, 3, 2, 1, 1, 2, 3, 3, 4, 5, 3, 2, 1, 1, 2, 3} be a list of numbers. Unique(list1)  
yields list2 = {1, 2, 3, 4, 5} and Frequency(list1) yields list3 = {4, 5, 7, 2, 1}. Command  
SigmaXX(list2, list3) yields the value 144.

### SigmaXY

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/SigmaXY/>

**语法：**

```
SigmaXY( <List of Points> )
SigmaXY( <List of x-coordinates>, <List of y-coordinates> )
```

**说明 / 示例：**

Calculates the sum of the products of the x- and y-coordinates.  
You can work out the covariance of a list of points using SigmaXY(list)/Length(list) - MeanX(list) * MeanY(list).  
Calculates the sum of the products of the x- and y-coordinates.  
Let A = (-3, 4), B = (-1, 4), C = (-2, 3) and D = (1, 3) be points.  
{x(A), x(B), x(C), x(D)} yields the x-coordinates of the points in a list list1 = {-3, -1, -2, 1} and  
{y(A), y(B), y(C), y(D)} yields the y-coordinates of the points in a list list2 = {4, 4, 3, 3}. Command  
SigmaXY(list1, list2) yields a = -19.

### SigmaYY

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/SigmaYY/>

**语法：**

```
SigmaYY( <List of Points> )
```

**说明 / 示例：**

Calculates the sum of squares of y-coordinates of the given points.  
Let list = {(-3, 4), (-1, 4), (-2, 3), (1, 3), (2, 2), (1, 5)} be a list of points. SigmaYY(list) yields a  
= 79.

### Spearman

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Spearman/>

**语法：**

```
Spearman( <List of Points> )
Spearman( <List of Numbers>, <List of Numbers> )
```

**说明 / 示例：**

Returns Spearman’s rank correlation  
coefficient of x-coordinates and y-coordinates of points of a list.  
Let list = {(-3, 4), (-1, 4), (-2, 3), (1, 3), (2, 2), (1, 5)} be a list of points. Spearman(list) yields a  
= -0.37.  
Returns Spearman’s rank correlation coefficient of two lists.  
Let list1 = {3, 2, 4, 5, 1, 6, 8, 9} and list2 = {5, 6, 8, 2, 1, 3, 4, 7} be two lists.  
Spearman(list1, list2) yields a = 0.24.

### Sum

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Sum/>

**语法：**

```
Sum( <List> )
Sum( <List>, <Number of Elements> )
Sum( <List>, <List of Frequencies> )
Sum( <Expression>, <Variable>, <Start Value>, <End Value> )
```

**说明 / 示例：**

Calculates the sum of all the elements in the list.  
Sum({1, 2, 3}) yields the number a = 6.  
Sum({x^2, x^3}) yields f(x) = x2 + x3.  
Sum(Sequence(i, i, 1, 100)) yields the number a = 5050.  
Sum({(1, 2), (2, 3)}) yields the point A = (3, 5).  
Sum({"a", "b", "c"}) yields the text "abc".  
Calculates the sum of the first n elements in the list.  
Sum({1, 2, 3, 4, 5, 6}, 4) yields the number a = 10.  
Returns the sum of the given list of values, considering the related frequencies.  
Sum({1, 2, 3, 4, 5}, {3, 2, 4, 4, 1}) yields a = 40.  
This command works for numbers, points, vectors, text, and functions.  
Lists must contain objects of the same type.  
CAS Syntax  
The following command works only in the  
CAS View.  
Computes the sum (\sum\_{t=Start Value}^{End Value}f(t)). End value can also be infinity.  
Sum(n^2, n, 1, 3) yields 14.  
Sum(r^k, k, 0, n) yields (\frac{r^{n+1} }{r - 1} - \frac{1}{r - 1}).  
Sum((1/3)^n, n, 0, Infinity) yields (\frac{3}{2}).

### SumSquaredErrors

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/SumSquaredErrors/>

**语法：**

```
SumSquaredErrors( <List of Points>, <Function> )
```

**说明 / 示例：**

Calculates the sum of squared errors, SSE, between the y-values of the points in the list and the function values of  
the x-values in the list.  
If we have a list of points L={(1, 2), (3, 5),(2, 2), (5, 2), (5, 5)} and have calculated for example:  
f(x)=FitPoly(L,1) and g(x)=FitPoly(L,2). SumSquaredErrors(L,f) yields 9 and  
SumSquaredErrors(L,g) yields 6.99, and therefore we can see, that g(x) offers the best fit, in the sense of  
the least sum of squared errors (Gauss).

### Sxx

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Sxx/>

**语法：**

```
Sxx( <List of Numbers> )
Sxx( <List of Points> )
```

**说明 / 示例：**

Calculates the statistic (\sum x^2 - \frac{(\sum x)^2}{n}).  
Calculates the statistic (\sum x^2 - \frac{(\sum x)^2}{n}) using the x-coordinates of the given points.

### Sxy

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Sxy/>

**语法：**

```
Sxy( <List of Points> )
Sxy( <List of Numbers>, <List of Numbers> )
```

**说明 / 示例：**

Calculates the statistic (\sum xy - \frac{(\sum x) (\sum y)}{n}) using the coordinates of the given points.  
Calculates the statistic (\sum xy - \frac{(\sum x) (\sum y)}{n}), where x are the values in the first list,  
and y are the values in the second given list.

### Syy

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Syy/>

**语法：**

```
Syy( <List of Points> )
```

**说明 / 示例：**

Calculates the statistic ( \sum y^2 -\frac{ (\sum y)^2}{n}) using the y-coordinates of the given points.

### TMean2Estimate

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/TMean2Estimate/>

**语法：**

```
TMean2Estimate( <List of Sample Data 1>, <List of Sample Data 2>, <Confidence Level>, <Boolean Pooled> )
TMean2Estimate( <Sample Mean 1>, <Sample Standard Deviation 1>, <Sample Size 1>, <Sample Mean 2>, <Sample Standard Deviation 2>, <Sample Size 2>, <Confidence Level>, <Boolean Pooled> )
```

**说明 / 示例：**

Calculates a t confidence interval estimate of the difference between two population means using the given sample data  
sets and confidence level.  
If Pooled = true, then population variances are assumed equal and sample standard deviations are combined in  
calculation.  
If Pooled = false, then population variances are not assumed equal and sample standard deviations are not combined.  
Results are returned in list form as {lower confidence limit, upper confidence limit}.  
Calculates a t confidence interval estimate of the difference between two population means using the given sample  
statistics and confidence level. Pooled is defined as above. Results are returned in list form as {lower  
confidence limit, upper confidence limit}.

### TMeanEstimate

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/TMeanEstimate/>

**语法：**

```
TMeanEstimate( <List of Sample Data>, <Confidence level> )
TMeanEstimate( <Sample Mean>, <Sample Standard Deviation>, <Sample Size>, <Confidence level> )
```

**说明 / 示例：**

Calculates a t confidence interval estimate of a population mean using the given sample data and confidence level.  
Results are returned in list form as {lower confidence limit, upper confidence limit}.  
Calculates a t confidence interval estimate of a population mean using the given sample statistics and confidence  
level. Results are returned in list form as {lower confidence limit, upper confidence limit}.

### TTest

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/TTest/>

**语法：**

```
TTest( <List of Sample Data>, <Hypothesized Mean>, <Tail> )
TTest( <Sample Mean>, <Sample Standard Deviation>, <Sample Size>, <Hypothesized Mean>, <Tail> )
```

**说明 / 示例：**

Performs a one-sample t-test of a population mean using the given list of sample data. Hypothesized Mean is the  
population mean assumed in the null hypothesis. Tail has possible values "<", ">" , "≠". These specify the  
alternative hypothesis as follows.  
"<" = population mean < Hypothesized Mean  
">" = population mean > Hypothesized Mean  
"≠" = population mean ≠ Hypothesized Mean  
Results are returned in list form as {Probability value, t-test statistic}.  
TTest({1, 2, 3, 4, 5}, 3, "<") yields {0.5, 0}.  
Performs a one-sample t-test of a population mean using the given sample statistics. Hypothesized Mean and Tail  
are defined as above. Results are returned in list form as {Probability value, t-test statistic}.  
TTest(4, 1, 12, 4, "≠") yields {1, 0}.

### TTest2

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/TTest2/>

**语法：**

```
TTest2( <List of Sample Data 1>, <List of Sample Data 2>, <Tail>, <Boolean Pooled> )
TTest2( <Sample Mean 1>, <Sample Standard Deviation 1>, <Sample Size 1>, <Sample Mean 2>, <Sample Standard Deviation 2>,<Sample Size 2>, <Tail>, <Boolean Pooled> )
```

**说明 / 示例：**

Performs a t-test of the difference between two population means using the given lists of sample data. Tail has  
possible values "<", ">" , "≠" that determine the following alternative hypotheses:  
"<" = difference in population means < 0  
">" = difference in population means > 0  
"≠" = difference in population means ≠ 0  
If Pooled = true, then population variances are assumed equal and sample standard deviations are combined in  
calculation.  
If Pooled = false, then population variances are not assumed equal and sample standard deviations are not combined.  
Results are returned in list form as {Probability value, t-test statistic}.  
Performs a t-test of the difference between two population means using the given sample statistics. Tail and  
Pooled are defined as above. Results are returned in list form as {Probability value, t-test statistic}.

### TTestPaired

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/TTestPaired/>

**语法：**

```
TTestPaired( <List of Sample Data 1>, <List of Sample Data 2>, <Tail> )
```

**说明 / 示例：**

Performs a paired t-test using the given lists of paired sample data. Tail has possible values "<", ">" , "≠" that  
determine the following alternative hypotheses:  
"<" = μ < 0  
">" = μ > 0  
"≠" = μ ≠ 0  
( μ is the mean paired difference of the population)  
Results are returned in list form as {Probability value, t-test statistic}.  
TTestPaired({1, 2, 3, 4, 5}, {1, 1, 3, 5, 5}, "<") yields {0.5, 0}.

### Variance

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Variance/>

**语法：**

```
Variance( <List of Raw Data> )
Variance( <List of Numbers>, <List of Frequencies> )
Variance( <List of Numbers> )
```

**说明 / 示例：**

Calculates the variance of list elements.  
Variance({1, 2, 3}) yields 0.67.  
Calculates the variance of list elements, considering the frequencies.  
Variance({1, 2, 3} , {1, 2, 1}) yields 0.5.  
CAS Syntax  
Calculates the variance of list elements. If the list contains undefined variables, it yields a formula for the  
variance.  
Variance({1, 2, a}) yields (\frac{2}{9} a^{2} - \frac{2}{3} a + \frac{2}{3}).

### ZMean2Estimate

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/ZMean2Estimate/>

**语法：**

```
ZMean2Estimate( <List of Sample Data 1>, <List of Sample Data 2>, <σ1>, <σ2>, <Confidence Level> )
ZMean2Estimate( <Sample Mean 1>, <σ1>, <Sample Size 1>, <Sample Mean 2 >, <σ2>, <Sample Size 2>, <Confidence Level>)
```

**说明 / 示例：**

Calculates a Z confidence interval estimate of the difference between two population means using the given sample data  
sets, population standard deviations and confidence level.  
Results are returned in list form as {lower confidence limit, upper confidence limit}.  
Two sample data list1 = {1, 4, 5, 4, 1, 3, 4, 2}, list2 = {2, 1, 3, 1, 2, 5, 2, 4} are given. The standard  
deviation of list1 is σ_1 = sqrt(2), the standard deviation of list2 is σ_2 = sqrt(1.75) and the confidence  
level is 0.75. ZMean2Estimate(list1, list2, σ_1, σ_2, 0.75) yields list3 = {-0.29, 1.29}.  
Calculates a Z confidence interval estimate of the difference between two population means using the given sample  
means, population standard deviations and confidence level.  
Results are returned in list form as {lower confidence limit, upper confidence limit}.

### ZMean2Test

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/ZMean2Test/>

**语法：**

```
ZMean2Test( <List of Sample Data 1>, <σ1>, <List of Sample Data 2>, <σ2>, <Tail> )
ZMean2Test( <Sample Mean 1 >, <σ1>, <Sample Size 1>, <Sample Mean 2 >, <σ2>, <Sample Size 2>, <Tail> )
```

**说明 / 示例：**

Performs a Z test of the difference between two population means using the given  
lists of sample data and the population standard deviations. Tail has possible values "<", ">" , "≠" that determine  
the following alternative hypotheses:  
"<" = difference in population means < 0  
">" = difference in population means > 0  
"≠" = difference in population means ≠ 0  
Results are returned in list form as {Probability value, Z test statistic}.  
Performs a Z test of the difference between two population means using the given sample statistics and population  
standard deviations. Tail is defined as above.

### ZMeanEstimate

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/ZMeanEstimate/>

**语法：**

```
ZMeanEstimate( <List of Sample Data>, <σ>, <Confidence Level> )
ZMeanEstimate( <Sample Mean>, <σ>, <Sample Size>, <Confidence Level> )
```

**说明 / 示例：**

Calculates a Z confidence interval estimate of a population mean using the given sample data, the population standard  
deviation and confidence level.  
Results are returned in list form as {lower confidence limit, upper confidence limit}.  
Calculates a Z confidence interval estimate of a population mean using the given sample statistics, the population  
standard deviation and confidence level.  
Results are returned in list form as {lower confidence limit, upper confidence limit}.

### ZMeanTest

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/ZMeanTest/>

**语法：**

```
ZMeanTest( <List of Sample Data>, <σ>, <Hypothesized Mean>, <Tail> )
ZMeanTest( <Sample Mean>, <σ>, <Sample Size>, <Hypothesized Mean>, <Tail> )
```

**说明 / 示例：**

Performs a one sample Z test of a population mean using the given list of sample  
data and the population standard deviation. Hypothesized Mean is the population mean assumed in the null hypothesis.  
Tail has possible values "<", ">" , "≠". These specify the alternative hypothesis as follows:  
"<" = population mean < *Hypothesized Mean*  
">" = population mean > *Hypothesized Mean*  
"≠" = population mean ≠ *Hypothesized Mean*  
Results are returned in list form as {Probability value, Z test statistic}.  
Performs a one sample Z test of a population mean using the given sample statistics and the population standard  
deviation. Hypothesized Mean and Tail are defined as above.  
Results are returned in list form as {Probability value, Z test statistic}.

### ZProportion2Estimate

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/ZProportion2Estimate/>

**语法：**

```
ZProportion2Estimate( <Sample Proportion 1 >, <Sample Size 1>, <Sample Proportion 2 >, <Sample Size 2>, <Confidence Level> )
```

**说明 / 示例：**

Calculates a Z confidence interval estimate of the difference between two proportions using the given sample  
statistics and confidence level.  
Results are returned in list form as {lower confidence limit, upper confidence limit}.

### ZProportion2Test

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/ZProportion2Test/>

**语法：**

```
ZProportion2Test( <Sample Proportion 1>, <Sample Size 1>, <Sample Proportion 2>, <Sample Size 2>, <Tail> )
```

**说明 / 示例：**

Performs a test of the difference between two population proportions using the given sample statistics. Tail has  
possible values "<", ">" , "≠". These specify the alternative hypothesis as follows:  
"<" = difference in population proportions < 0  
">" = difference in population proportions > 0  
"≠" = difference in population proportions ≠ 0  
Results are returned in list form as {Probability value, Z test statistic}.

### ZProportionEstimate

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/ZProportionEstimate/>

**语法：**

```
ZProportionEstimate ( <Sample Proportion >, <Sample Size >, <Confidence Level> )
```

**说明 / 示例：**

Calculates a Z confidence interval estimate of a population proportion using the given sample statistics and  
confidence level. Results are returned in list form as {lower confidence limit, upper confidence limit}.

### ZProportionTest

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/ZProportionTest/>

**语法：**

```
ZProportionTest( <Sample Proportion>, <Sample Size>, <Hypothesized Proportion>, <Tail> )
```

**说明 / 示例：**

Performs a one sample Z test of a proportion using the given sample statistics. Hypothesized Proportion is the  
population proportion assumed in the null hypothesis. Tail has possible values "<", ">" , "≠". These specify the  
alternative hypothesis as follows:  
"<" = population proportion < Hypothesized Proportion  
">" = population proportion > Hypothesized Proportion  
"≠" = population proportion ≠ Hypothesized Proportion  
Results are returned in list form as {Probability value, Z test statistic}.

## 金融命令

> 共 5 个命令

### FutureValue

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/FutureValue/>

**语法：**

```
FutureValue( <Rate>, <Number of Periods>, <Payment>, <Present Value (optional)>, <Type (optional)> )
```

**说明 / 示例：**

Returns the future value of an investment based on periodic, constant payments and a constant interest rate.  
<Rate> Interest rate per period.  
<Number of Periods> Total number of payment periods in an annuity.  
<Payment> The amount paid in each period.  
<Present Value (optional)> Total amount that a series of future payments is worth now. If you do not enter a value,  
it is assumed to be 0.  
<Type (optional)> Indicates when payments are due. If you do not enter a value or you enter 0 the payment is due at  
the end of the period. If you enter 1 it is due at the beginning of the period.  
FutureValue(10%/12, 15, -200, 0, 1) yields a future value of 3207.99.  
Make sure that you are consistent about the units you use for <Rate> and <Number of Periods>. If you make  
monthly payments on a four-year loan at an annual interest rate of 10 percent, use 10%/12 for rate and 4*12 for number  
of payments.  
For all arguments, cash paid out is represented by negative numbers and cash received by positive numbers.  
See also Payment, Rate, Present  
Value and Periods commands.

### Payment

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Payment/>

**语法：**

```
Payment( <Rate>, <Number of Periods>, <Present Value>, <Future Value (optional)>, <Type (optional)> )
```

**说明 / 示例：**

Calculates the payment for a loan based on constant payments and a constant interest rate.  
<Rate> Interest rate per period.  
<Number of Periods> Total number of payments for the loan.  
<Present Value> Total amount that a series of future payments is worth now.  
<Future Value (optional)> A cash balance you want to attain after the last payment. If you do not enter a future  
value, it is assumed to be 0.  
<Type (optional)> Indicates when payments are due. If you do not enter a value or you enter 0 the payment is due at  
the end of the period. If you enter 1 it is due at the beginning of the period.  
Payment(6%/12, 10, 10000, 0,1) yields a monthly payment for a loan of -1022.59.  
Make sure that you are consistent about the units you use for <Rate> and <Number of Periods>. If you make  
monthly payments on a four-year loan at an annual interest rate of 6 percent, use 6%/12 for rate and 4*12 for number of  
payments.  
For all arguments, cash paid out is represented by negative numbers and cash received by positive numbers.  
See also Rate, Periods, Present  
Value and Future Value commands.

### Periods

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Periods/>

**语法：**

```
Periods( <Rate>, <Payment>, <Present Value>, <Future Value (optional)>, <Type (optional)> )
```

**说明 / 示例：**

Returns the number of periods for an annuity based on periodic, fixed payments and a fixed interest rate.  
<Rate> Interest rate per period.  
<Payment> The amount paid in each period.  
<Present Value> Total amount that a series of future payments is worth now.  
<Future Value (optional)> A cash balance you want to attain after the last payment. If you do not enter a future  
value, it is assumed to be 0.  
<Type (optional)> Indicates when payments are due. If you do not enter a value or you enter 0 the payment is due at  
the end of the period. If you enter 1 it is due at the beginning of the period.  
Periods(10%/12, -200, -400, 10000) yields a number of payments of 39.98.  
Periods(10%/12, -200, -400, 10000, 1) yields a number of payments of 39.7.  
If you make monthly payments on an annual interest rate of 10 percent, use 10%/12 for <Rate>.  
For all arguments, cash paid out is represented by negative numbers and cash received by positive numbers.  
See also Payment, Rate, Present  
Value and Future Value commands.

### PresentValue

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/PresentValue/>

**语法：**

```
PresentValue( <Rate>, <Number of Periods>, <Payment>, <Future Value (optional)>, <Type (optional)> )
```

**说明 / 示例：**

Returns the total amount of payments of an investment.  
<Rate> Interest rate per period.  
<Number of Periods> Total number of payments for the loan.  
<Payment> The amount paid in each period.  
<Future Value (optional)> A cash balance you want to attain after the last payment. If you do not enter a future  
value, it is assumed to be 0.  
<Type (optional)> Indicates when payments are due. If you do not enter a value or you enter 0 the payment is due at  
the end of the period. If you enter 1 it is due at the beginning of the period.  
PresentValue(12%/12, 4*12, -100, 5000, 0) yields a present value of 696.06.  
PresentValue(12%/12, 4*12, -100, 5000, 1) yields a present value of 734.07.  
Make sure that you are consistent about the units you use for <Rate> and <Number of Periods>. If you make  
monthly payments on a four-year loan at an annual interest rate of 12 percent, use 12%/12 for rate and 4*12 for number  
of payments.  
For all arguments, cash paid out is represented by negative numbers and cash received by positive numbers.  
See also Payment, Periods, Rate and  
Future Value commands.

### Rate

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Rate/>

**语法：**

```
Rate( <Number of Periods>, <Payment>, <Present Value>, <Future Value (optional)>, <Type (optional)>, <Guess (optional)> )
```

**说明 / 示例：**

Returns the interest rate per period of an annuity.  
<Number of Periods> Total number of payments for the loan.  
<Payment> The amount paid in each period.  
<Present Value> Total amount that a series of future payments is worth now.  
<Future Value (optional)> A cash balance you want to attain after the last payment. If you do not enter a future  
value, it is assumed to be 0.  
<Type (optional)> Indicates when payments are due. If you do not enter a value or you enter 0 the payment is due at  
the end of the period. If you enter 1 it is due at the beginning of the period.  
<Guess (optional)> Your guess for what the rate will be.  
Rate(5*12, -300, 10000) yields a monthly rate of 0.02 (2%).  
If you make monthly payments on a five-year loan use 5*12 for <Number of Periods>.  
For all arguments, cash paid out is represented by negative numbers and cash received by positive numbers..  
See also Payment, Periods,  
Present Value and Future Value commands.

## 文本命令

> 共 27 个命令

### ContingencyTable

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/ContingencyTable/>

**语法：**

```
ContingencyTable( <List of Text>, <List of Text> )
ContingencyTable( <List of Text>, <List of Text>, <Options> )
ContingencyTable( <List of Row Values>, <List of Column Values>, <Frequency Table> )
ContingencyTable( <List of Row Values>, <List of Column Values> <Frequency Table>, <Options> )
```

**说明 / 示例：**

Draws a Contingency Table created from the two given lists. Unique  
values from the first list are used as row values in the table. Unique values from the second list are used as column  
values in the table.  
Draws a Contingency Table created from the two given lists as  
described above. The text Options controls the display of optional calculations within the table.  
Possible values for Options are "|", "*", "+", "e", "k", "=".  
"|" = show column percentages  
"*" = show row percentages  
"+" = show total percentages  
"e" = show expected counts  
"k" = show Chi Squared contributions  
"=" = show results of a Chi Squared test  
Draws a Contingency Table using the given list of row values, column  
values and corresponding frequency table.  
ContingencyTable({"Males","Females"},{"Right-handed", "Left-handed"},{{43,9},{44,4}}) yields the corresponding  
Contingency Table.  
Draws a Contingency Table using the given list of row values, column  
values and corresponding frequency table. The text Options controls the display of optional calculations within the  
table as described above.  
ContingencyTable({"Males","Females"},{"Right-handed", "Left-handed"},{{43,9},{44,4}},"\_") yields the corresponding  
Contingency Table showing the row percentages.

### ContinuedFraction

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/ContinuedFraction/>

**语法：**

```
ContinuedFraction( <Number> )
ContinuedFraction( <Number>, <Level> )
ContinuedFraction( <Number>, <Level> (optional), <Boolean Shorthand> )
```

**说明 / 示例：**

Creates the continued fraction approximating a given number. The result is a LaTeX  
text object. The fraction is computed numerically within precision 10-8.  
ContinuedFraction(5.45) gives (5 + \frac{1}{ 2+ \frac{1}{4+ \frac{1}{ 1+ \frac{1}{ 1 } } } })  
Creates the continued fraction approximating the given number. The number of quotients is less than or equal to Level, but never exceeding the number of quotients needed to achieve the numerical precision of 10-8.  
ContinuedFraction(5.45, 3) gives (5 + \frac{1}{ 2+ \frac{1}{4+ ... } })  
Creates the continued fraction approximating the given number. If the parameter Level is specified, the number of quotients is less than or equal to Level, but never exceeding the number of quotients needed to achieve the numerical precision of 10-8. When Shorthand is true, the LaTeX text uses a shorter syntax, and contains a list of the integer parts of the continued fraction.  
ContinuedFraction(5.45, true) gives [5; 2, 4, 1, 1]  
ContinuedFraction(5.45, 3, true) gives [5; 2, 4, …]

### First

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/First/>

**语法：**

```
First( <List> )
First( <List>, <Number n of elements> )
First( <Text> )
First( <Text> , <Number n of elements> )
First( <Locus>, <Number n of elements> )
```

**说明 / 示例：**

Gives a new list that contains the first element of the given list.  
First({1, 4, 3}) yields {1}.  
To get the first element use Element({1, 4, 3}, 1).  
Gives a new list that contains just the first n elements of the given list.  
First({1, 4, 3}, 2) yields {1, 4}.  
Gives first character of the text.  
First("Hello") yields "H".  
Gives the first n characters of the text.  
First("Hello",2) yields "He".  
This command is useful for  
loci generated by NSolveODE Command - It returns list points that were created in the  
first n steps of the numeric ODE-solving algorithm.  
loci generated using ShortestDistance Command,  
TravelingSalesman Command, Voronoi Command,  
MinimumSpanningTree Command and ConvexHull  
Command Commands - It returns vertices of the graph.  
See also Last Command.

### FormulaText

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/FormulaText/>

**语法：**

```
FormulaText( <Object> )
FormulaText( <Object>, <Boolean for Substitution of Variables> )
FormulaText( <Object>, <Boolean for Substitution of Variables>, <Boolean Show Name> )
```

**说明 / 示例：**

Returns the formula that defines the object as a LaTeX text. Values are substituted for variables by default.  
Let a = 2 and f(x) = a x2. FormulaText(f) returns 2 x2 (as a LaTeX text).  
In GeoGebra Classic v.5, the command FormulaText($1) returns the content of cell 1 of the CAS View as a LaTeX text.  
Returns the formula that defines the object as a LaTeX text. The Boolean variable determines if values are substituted for  
variables (true) or if variable names are shown in the text (false).  
Let a = 2 and f(x) = a x2.  
FormulaText(f, true) returns 2 x2 (as a LaTeX text).  
FormulaText(f, false) returns a x2 (as a LaTeX text).  
Returns the formula that defines the object as a LaTeX text. The first Boolean variable determines if values are substituted for  
variables (true) or if variable names are shown in the text (false), the second Boolean variable determines if the  
object name is shown in the text (true) or not (false).  
Let a = 2 and f(x) = a x2.  
FormulaText(f, true, true) returns f(x) = 2 x2 (as a LaTeX text).  
FormulaText(f, false, false) returns a x2 (as a LaTeX text).

### FractionText

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/FractionText/>

**语法：**

```
FractionText( <Number> )
FractionText( <Point> )
FractionText( <Number>, <Boolean Single fraction>)
```

**说明 / 示例：**

Creates and shows in the  
Graphics View a LaTeX text containing the fraction form of the given number.  
Given line a: y = 1.5 x + 2, FractionText(Slope(a)) creates the LaTeX text (\frac{3}{2}).  
Creates and shows in the  
Graphics View a LaTeX text containing the fraction form of the coordinates of the given  
point.  
Given point A=(1.33,0.8), FractionText(A) creates the LaTeX text ( \left( \frac{133}{100} ,\frac{4}{5}  
\right) ).  
Creates and shows in the  
Graphics View a LaTeX text containing the fraction form of the given number.  
The boolean sets the position of a possible negative sign of the fraction. If true, the minus sign will be displayed  
in the numerator, if false the minus sign will be displayed in front of the fraction.  
Given the number n = -0.8 , then  
FractionText(n, true) creates the LaTeX text (\frac{- 4}{5}).  
FractionText(n, false) creates the LaTeX text (-\frac{4}{5}).  
See also SurdText command.

### FrequencyTable

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/FrequencyTable/>

**语法：**

```
FrequencyTable( <List of Raw Data> )
FrequencyTable( <Boolean Cumulative>, <List of Raw Data> )
FrequencyTable( <List of Class Boundaries>, <List of Raw Data> )
FrequencyTable( <Boolean Cumulative>, <List of Class Boundaries>, <List of Raw Data> )
FrequencyTable( <List of Class Boundaries>, <List of Raw Data>, <Use Density> , <Density Scale Factor (optional)> )
FrequencyTable( <Boolean Cumulative>, <List of Class Boundaries>, <List of Raw Data>, <Use Density> , <Density Scale Factor (optional)> )
FrequencyTable( <List of Raw Data>,<Scale Factor (optional)> )
```

**说明 / 示例：**

Returns a table (as text) whose first column contains sorted list of unique elements of list L and second column  
contains the count of the occurrences of value in the first column. List L can be numbers or text.  
If Cumulative = false, returns the same table as Frequency( <List of Raw Data> )  
If Cumulative = true, returns a table whose first column is the same as in FrequencyTable( <List of Raw Data> ) and  
the second contains cumulative frequencies of values in the first column.  
Returns a table (as text) whose first column contains intervals (classes) and second column contains the count of  
numbers in List of Raw Data, which belong to the interval in the first column. All intervals except the highest  
interval are of the form [a, b). The highest interval has the form [a, b].  
If Cumulative = false, returns the same table as FrequencyTable( <List of Class Boundaries>, <List of Raw Data> )  
If Cumulative = true, returns a table whose first column is the same as in FrequencyTable( <List of Raw Data> ) and  
the second contains cumulative frequencies of values in the first column.  
Returns a table (as text) whose first column contains intervals (classes) and second contains frequencies for the  
corresponding Histogram Command.  
Returns a table (as text) whose first column contains intervals (classes) and second contains frequencies for the  
corresponding Histogram Command.  
Returns a table (as text) whose first column Value contains a sorted list of unique elements of the <List of Raw  
Data> and second column Frequency contains the count of the occurrences of value in the first column multiplied by  
the <Scale Factor>. The list can be numbers or text.  
FrequencyTable({"red", "red", "green", "green", "blue"}, 5) returns a table with first column Value with entries  
blue, green, red (alphabetical order) and second column Frequency with entries 5, 10, 10.  
FrequencyTable({1, 1, 1, 2, 2, 3, 3, 4, 5}, 2) returns a table with first column Value with entries 1, 2, 3, 4,  
5 and second column Frequency with entries 6, 4, 4, 2, 2.  
In the list there appears 1 three-times, so the count of the occurrences of 1 (=3) has to be multiplied by the scale  
factor 2 to get entry 6 in the second column.  
This command is similar to Frequency Command and Histogram  
Command. Articles about these commands contain some related examples.

### IndexOf

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/IndexOf/>

**语法：**

```
IndexOf( <Object>, <List> )
IndexOf( <Object>, <List>, <Start Index> )
IndexOf( <Text>, <Text> )
IndexOf( <Text>, <Text>, <Start Index> )
```

**说明 / 示例：**

Returns position of first occurrence of Object in List.  
IndexOf(5, {1, 3, 5, 2, 5, 4}) returns 3.  
When the object is not found, result is undefined.  
Same as above, but the search starts at given index.  
IndexOf(5, {1, 3, 5, 2, 5, 4}, 3) returns 3.  
IndexOf(5, {1, 3, 5, 2, 5, 4}, 4) returns 5.  
IndexOf(5, {1, 3, 5, 2, 5, 4}, 6) returns undefined.  
Specifies the position at which the short text appears for the first time in the whole text.  
IndexOf("Ge", "GeoGebra") returns 1.  
Same as above, but the search starts at given index.  
IndexOf("Ge", "GeoGebra",2) returns 4.

### Last

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Last/>

**语法：**

```
Last( <List> )
Last( <List>, <Number of elements> )
Last( <Text> )
Last( <Text> , <Number of elements> )
```

**说明 / 示例：**

Gives a new list that contains the last element of the initial list.  
Last({1, 4, 3}) yields {3}.  
To get the last element use Element({1, 4, 3}, 3).  
Gives a new list that contains just the last n elements of the initial list.  
Last({1, 4, 3}, 2) yields {4, 3}.  
Gives last character of the text.  
Last("Hello") yields "o".  
Gives the last n characters of the text.  
Last("Hello", 2) yields "lo".  
See also First Command.

### Length

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Length/>

**语法：**

```
Length( <Object> )
Length( <Vector> ) yields the length of the vector.
Length( <Point> ) yields the length of the position vector of the given point.
Length( <List> ) yields the length of the list, which is the number of elements in the list.
Length( <Text> ) yields the number of characters in the text.
Length( <Locus> ) returns the number of points that the given locus is made up of. Use
Length( <Arc> ) returns the arc length (i.e. just the length of the curved section) of an arc or sector.
Length( <Function>, <Start x-Value>, <End x-Value> )
Length( <Function>, <Start Point>, <End Point> )
Length( <Curve>, <Start t-Value>, <End t-Value> )
Length( <Curve>, <Start Point>, <End Point> )
Length( <Function>, <Variable>, <Start x-Value>, <End x-Value> )
```

**说明 / 示例：**

Yields the length of the object.  
Perimeter(Locus) to get the length of the locus itself. For details see the article about  
First Command.  
Yields the length of the function graph in the given interval.  
Length(2x, 0, 1) returns 2.236067977, about (\sqrt{5}).  
Yields the length of the function graph between the two points.  
If the given points do not lie on the function graph, their x‐coordinates are used to determine the interval.  
Yields the length of the curve between the two values of the parameter.  
Yields the length of the curve between the two points that lie on the curve.  
CAS Syntax  
Calculates the length of a function graph between the two points.  
Length(2 x, 0, 1) yields (\sqrt{5}).  
Calculates the length of a function graph from Start x-value to End x-value.  
Length(2 a, a, 0, 1) yields (\sqrt{5}).  
See also  
Distance or Length tool.

### LetterToUnicode

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/LetterToUnicode/>

**语法：**

```
LetterToUnicode( "<Letter>" )
```

**说明 / 示例：**

Converts a single letter into the corresponding Unicode number.  
LetterToUnicode("a") returns the number 97.  
The letter needs to be enclosed in double quotes in order to be recognized as text.  
See also UnicodeToLetter Command and TextToUnicode Command.

### Ordinal

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Ordinal/>

**语法：**

```
Ordinal( <Integer> )
```

**说明 / 示例：**

Turns a number into an ordinal (as a text).  
Ordinal(5) returns "5th".

### ParseToFunction

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/ParseToFunction/>

**语法：**

```
ParseToFunction( <Text> )
ParseToFunction( <Function>, <Text> )
ParseToFunction( <Text>, <List of variables> )
```

**说明 / 示例：**

Parses the text containing the function definition and creates the corresponding function.  
ParseToFunction("x^2") creates the function f(x) = x2.  
ParseToFunction("t+2/t") creates the function f(t) = t + 2/t.  
Parses the string and stores the result to a function f, which must be defined and  
free before the command is used.  
Define f(x) = 3x² + 2 and text1 = "f(x) = 3x + 1". ParseToFunction(f, text1) returns f(x) = 3x +1.  
Parses the text containing the function definition and creates the corresponding function of the  
variables defined in the list.  
ParseToFunction("2u+3v",{"u", "v"}) creates the function a(u,v) = 2u + 3v.  
See also ParseToNumber command.

### ParseToNumber

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/ParseToNumber/>

**语法：**

```
ParseToNumber( <Number>, <Text> )
ParseToNumber( <Text> )
```

**说明 / 示例：**

Parses the text and stores the result to a number a, which must be defined and  
free before the command is used.  
Define a = 3 and text1 = "6". ParseToNumber(a, text1) returns a = 6.  
This is a scripting command which only sets the value of a number once. To  
convert a text text1 into a number which is updated dynamically, use FromBase(text1,10).  
Parses the text and stores the result to a number.  
ParseToNumber("1+2+5-pi") creates the number a = 4.86.  
See also ParseToFunction command.

### ReadText

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/ReadText/>

**语法：**

```
ReadText( <Text> )
```

**说明 / 示例：**

This command allows authors to include information for visually impaired users, making their applets more  
accessible. To hear the output you need to install a screen reader such as  
NVDA or VoiceOver. Currently it is only supported in the online version of GeoGebra.  
Tells the screen reader to read given text immediately.

### ReplaceAll

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/ReplaceAll/>

**语法：**

```
ReplaceAll( <Text>, <Text to Match>, <Text to Replace> )
```

**说明 / 示例：**

Creates a new text containing the given text whose text to match has been replaced with the given text to  
replace.  
ReplaceAll("3cos(t)+cos(2y)", "cos", "sin") creates the new text "3sin(t)+sin(2y)".  
Use the FormulaText command to create a LaTeX text.  
FormulaText(ReplaceAll("3cos(t)+cos(2y)", "cos", "sin")) creates the new LaTeX text "3sin(t)+sin(2y)".

### RotateText

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/RotateText/>

**语法：**

```
RotateText( <Text>, <Angle> )
```

**说明 / 示例：**

Creates a new LaTeX text, rotated by the given angle.  
The text needs to be enclosed in double quotes ".  
The text is rotated around the top left corner (also known as Corner 4) of the box containing it, and placed at the origin of the coordinate system.  
The default setting for the angle is radians. Use the degree symbol ° for rotation angles measured in degrees.  
RotateText("a = 5", 45°)  
If you want to place the text "GeoGebra", rotated by 42°, at point (6,6), use the command Text(RotateText("GeoGebra", 42°), (6, 6),true,true)

### ScientificText

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/ScientificText/>

**语法：**

```
ScientificText( <Number> )
ScientificText( <Number>, <Precision> )
```

**说明 / 示例：**

This command differs among variants of English:  
StandardForm (UK)  
ScientificText (US + Aus)  
Creates a text displaying the given number in scientific notation.  
The text is placed with the top left corner (Corner 4) of its box at the origin of the coordinate system.  
ScientificText(0.002) gives 2 × 10-3.  
Creates a text displaying the given number in scientific notation, rounded to the number of  
significant digits specified by precision.  
ScientificText(e,5) gives 2.7183 × 100.

### Simplify

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Simplify/>

**语法：**

```
Simplify( <Function> )
Simplify( <Text> )
```

**说明 / 示例：**

Simplifies the terms of the given function, if possible.  
Simplify(x + x + x) yields the function f(x) = 3x.  
Attempts to tidy up text expressions by removing repeated negatives etc.  
For a = b = c = -1 Simplify("f(x) = " + a + "x² + " + b + "x + " + c) yields the text f(x) = -x2 - x -  
1\.  
The FormulaText Command normally produces better results and is simpler.  
This command needs to load the Computer Algebra System, so can be slow on some computers. Try using the  
Polynomial Command instead.  
CAS Syntax  
Simplifies the terms of the given function, if possible. Undefined variables can be included in the terms.  
Simplify(3 \* x + 4 \* x + a \* x) yields a x + 7x.  
Assume(x<2,Simplify(sqrt(x-2sqrt(x-1)))) yields -sqrt(abs(x - 1)) + 1  
Assume(x>2,Simplify(sqrt(x-2sqrt(x-1)))) yields sqrt(x - 1) + 1  
See also Factor Command, Assume Command,  
PartialFractions Command, Expand Command,  
Polynomial Command.

### Split

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Split/>

**语法：**

```
Split( <Text>, <List of Texts to split on>)
```

**说明 / 示例：**

Creates the list of texts obtained by splitting the given text at the given separators (not included in the list).  
Split("3cos(t)cos(2y)", {"cos"}) returns {"3", "(t)", "(2y)"}.

### SurdText

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/SurdText/>

**语法：**

```
SurdText( <Point> )
SurdText( <Number> )
SurdText( <Number>, <List> )
```

**说明 / 示例：**

Creates a text representation of the point, with coordinates in the form (\frac{a+b\sqrt{c}}{d}).  
SurdText((2.414213562373095, 1.414213562373095)) creates the text ((1 + \sqrt{2}, \sqrt{2}))  
Creates a text representation of the number in the form (\frac{a+b\sqrt{c}}{d}).  
SurdText(2.414213562373095) creates the text (1 + \sqrt{2})  
SurdText(2.439230484541326) creates the text (\frac{7+3 \sqrt{3} }{5})  
Creates a text representation of the number, rewritten as a multiple of the constants in the list. If the list is empty, the command uses a  
list of common constants.  
SurdText(3.718281828459045, {exp(1)}) creates the text (e + 1)  
SurdText(5.382332347441762, {sqrt(2), sqrt(3), sqrt(5)}) creates the text ( \sqrt{5} + \sqrt{3} + \sqrt{2})  
SurdText(1.693147180559945, {ln(2)}) creates the text ( \ln(2) + 1)  
In order to use this command in a Text object, the option LaTeX Formula needs to be enabled in the Text tab of  
the Properties Dialog  
of the text.  
Since this command works with a rounded decimal number as input, in some cases the result might be unexpected.  
If a suitable answer can’t be found, the number will be returned. For example, the command SurdText(1.23456789012345) returns 1.23456789012345.  
See also the FractionText and ScientificText commands.

### TableText

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/TableText/>

**语法：**

```
TableText( <List>, <List>, … )
TableText( <List>, <List>, …, <Alignment of Text> )
TableText( <List>, <List>, …, <Alignment of Text>, <Minimum Cell Width>)
TableText( <List>, <List>, …, <Alignment of Text>, <Minimum Cell Width>, <Minimum Cell Height>)
```

**说明 / 示例：**

Creates a text that contains a table of the list objects.  
TableText({x^2, 4}, {x^3, 8}, {x^4, 16}) creates a table as a text object with three rows and two columns. All  
items of the table are left aligned.  
TableText(Sequence(i^2, i, 1, 10)) creates a table as a text object with one row. All items of the table are  
left aligned.  
By default, each list is displayed in its own row of the table.  
Creates a text that contains a table of the list objects. The optional text “Alignment of text” controls the  
orientation and alignment of the table text, as well as the alignment of the separator in decimal values.  
Possible values are "vl", "vc", "vr", "v", "h", "hl", "hc", "hr" and "." or "%" - the default value is "hl".  
"v" = vertical, i. e. lists are columns  
"h" = horizontal, i. e. lists are rows  
"l" = left aligned  
"r" = right aligned  
"c" = centered  
"." = aligned on decimal points  
"a" = like "." but also displays the padding zeros  
"%" = converted to a percentage, and aligned on decimal points  
"p" = like "%" but also displays the padding zeros  
TableText({1, 2, 3, 4}, {1, 4, 9, 16}, "v") creates a text with two columns and four rows whose elements are  
left aligned.  
TableText({1, 2, 3, 4}, {1, 4, 9, 16}, "h") creates a text with two rows and four columns whose elements are  
left aligned.  
TableText({11.2, 123.1, 32423.9, "234.0"}, "vr") creates a text with one column whose elements are right  
aligned.  
TableText({A1:A10, B1:B10, C1:C10}, "vl") creates a text with three columns whose elements (left aligned) are  
the objects in the given Spreadsheet cells.  
TableText({{2011.56, 2, 3.7, 4}, {1, 4.2, 9, 16.365}}, "v.") creates a text whose elements are aligned on  
decimal points  
TableText({{2011.56, 2, 3.7, 4}, {1, 4.2, 9, 16.365}}, "v%") creates a text whose elements are converted to a  
percentage, and aligned on decimal points  
Creates a text that contains a table of the list objects, with given alignment and cell width (in pixels).  
TableText({x², 4}, {x³, 8}, {x⁴, 16}, "c", 50) creates a table with three rows and two columns. All items in the  
table are centered and the cell width is 50 px.  
Creates a text that contains a table of the list objects, with given alignment, cell width and height (in pixels).  
TableText({{"left", "center", "right"}, {"l", "c", "r"}}, "lcr", 45, 80) creates a table with two rows and  
three columns. All items in the table have a different alignment. Each cell of the table is 45 px wide and 80 px high.  
The width and the height of a TableText depend on the font size setting.  
It’s also possible to insert:  
different types of brackets, using the following symbols ||||, ||, {}, [] or ()  
line separators, using the symbol \_  
column separators, using the symbol |  
different colourings  
TableText({1, 2}, {3, 4}, "c()") creates the text (\begin{pmatrix}{} 1 & 2 \ 3 & 4 \ \end{pmatrix} )  
TableText({1, 2}, {3, 4}, "c|\_") creates the text  
TableText({1, 2}, {3, 4}, "||") creates the text ( \begin{vmatrix}{} 1 & 2 \ 3 & 4 \ \end{vmatrix} )  
TableText({1, 2}, {3, 4}, "||||") creates the text (\begin{Vmatrix}{} 1 & 2 \ 3 & 4 \ \end{Vmatrix} )  
TableText({{"2x+3y=5","5x+8y=12"}},"{v") creates the text ( \left{\begin{matrix} 2x+3y=5\ 5x+8y=12  
\end{matrix}\right.)  
TableText({{1, 2, 3, 4}, {1, 2, 3, 4}, {1, 2, 3, 4}, {1, 2, 3, 4}, {1, 2, 3, 4}}, "-/|\_v") creates a table with  
border and no separation lines.  
TableText({{1, 2, 3, 4}, {1, 2, 3, 4}, {1, 2, 3, 4}, {1, 2, 3, 4}, {1, 2, 3, 4}}, "|11001 \_110001 h") creates a  
table with border and one separation line to the right of the first column and under the first row of contents. The  
value 1 in the syntax means that there is a separation line between the numbers and the value 0 means that there is no  
separation line or border.  
TableText({{"\blue{0, 1, 2, 3, 4}", "\red{4, 3, 2, 1, 0}"}}, "v") creates a table having the objects in the  
first row coloured in blue, the ones in the second row coloured in red.  
The Style Bar of a TableText object allows the user to customize the object’s appearance,  
background and text colour and text style.  
Online examples by Mike

### Take

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Take/>

**语法：**

```
Take( <List>, <Start Position> )
Take( <Text>, <Start Position> )
Take( <List>, <Start Position>, <End Position> )
Take( <Text>, <Start Position>, <End Position> )
```

**说明 / 示例：**

Returns a list containing the elements from Start Position to the end of the initial list.  
Take({2, 4, 3, 7, 4}, 3) yields {3, 7, 4}.  
Returns a text containing the elements from Start Position to the end of the initial text.  
Take("GeoGebra", 3) yields the text oGebra.  
Returns a list containing the elements from Start Position to End Position of the initial list.  
Take({2, 4, 3, 7, 4}, 3, 4) yields {3, 7}.  
Returns a text containing the elements from Start Position to End Position of the initial text.  
Take("GeoGebra", 3, 6) yields the text oGeb.

### Text

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Text/>

**语法：**

```
Text( <Object> )
Text( <Object>, <Boolean for Substitution of Variables> )
Text( <Object>, <Point> )
Text( <Object>, <Point>, <Boolean for Substitution of Variables> )
Text( <Object>, <Point>, <Boolean for Substitution of Variables>, <Boolean for LaTeX formula> )
Text( <Object>, <Point>, <Boolean for Substitution of Variables>, <Boolean for LaTeX formula>, <Horizontal alignment [-1|0|1]>, <Vertical alignment [-1|0|1]> )
```

**说明 / 示例：**

Creates a text containing the formula of the given object.  
If a = 2 and c = a2, then Text(c) creates the text "4".  
By default, values are substituted to the corresponding variables.  
Creates a text containing the formula of the given object. The Boolean variable determines whether values are substituted to  
variables (true) or variable names are shown in the text (false).  
If a = 2 and c = a2, then  
Text(c, true) creates the text "4" and  
Text(c, false) creates the text "a2".  
Creates a text containing the formula of the given object at the given position (point).  
Text("hello", (2, 3)) creates the text "hello" at (2, 3).  
Creates a text containing the formula of the given object at the given position (point). The Boolean variable  
determines whether values are substituted to variables (true) or variable names are shown in the text (false).  
If a = 2 and c = a2, then Text(c, (2, 1), true) creates the text "4" at (2, 1).  
Creates a text containing the formula of the given object at the given position (point). The first Boolean variable  
determines whether values are substituted to variables (true) or variable names are shown in the text (false). If  
the second Boolean variable is true, the text is rendered using LaTeX.  
If a = 2 and c = a2, then Text(c, (2, 1), true, true) creates the LaTeX text "4" at (2, 1).  
Creates a text containing the formula of the given object at the given position (point). The first Boolean variable  
determines whether values are substituted to variables (true) or variable names are shown in the text (false). If  
the second Boolean variable is true, the text is rendered using LaTeX. The values -1, 0, 1 define the horizontal and vertical alignment, shifting the text from the default position respectively as follows:  
-1: horizontal shift leftwards / vertical shift downwards  
0: centers the text object horizontally / vertically at the given point  
1: horizontal shift rightwards / vertical shift upwards  
If a = 2 and c = a2, then Text(c, (2, 1), true, true, -1, 0) creates the LaTeX text "4" to the left of  
(2, 1), and vertically aligned with the point.  
See also Text tool.

### TextToUnicode

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/TextToUnicode/>

**语法：**

```
TextToUnicode( "<Text>" )
```

**说明 / 示例：**

Turns the text into a list of Unicode numbers, one for each character.  
TextToUnicode("Some text") gives you the list of Unicode numbers {83, 111, 109, 101, 32, 116, 101, 120, 116}.  
If text1 is "hello", then TextToUnicode(text1) gives you the list of Unicode numbers {104, 101, 108, 108,  
111}.  
See also UnicodeToText Command and  
LetterToUnicode Command.

### UnicodeToLetter

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/UnicodeToLetter/>

**语法：**

```
UnicodeToLetter( <Integer> )
```

**说明 / 示例：**

Converts the integer Unicode number back into a letter which is displayed as a text object in the  
Graphics  
View.  
UnicodeToLetter(97) yields the text "a".  
See also LetterToUnicode Command and  
UnicodeToText Command.

### UnicodeToText

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/UnicodeToText/>

**语法：**

```
UnicodeToText( <List of Integers> )
```

**说明 / 示例：**

Converts the integer Unicode numbers back into text.  
UnicodeToText({104, 101, 108, 108, 111}) yields the text "hello".  
See also TextToUnicode Command and  
UnicodeToLetter Command.

### VerticalText

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/VerticalText/>

**语法：**

```
VerticalText( <Text> )
VerticalText( <Text>, <Point> )
```

**说明 / 示例：**

Creates a LaTeX text, containing the given text rotated 90° counter-clockwise.  
The text needs to be enclosed in double quotes ".  
The text is rotated such that the top left corner (also known as Corner 4) of the box containing it is placed at the origin of the coordinate system.  
VerticalText("a = 5") creates the LaTeX text "a = 5" displayed vertically, with its top left corner at (0,0)  
Creates at the given point a LaTeX text, containing the given text rotated 90° counter-clockwise.  
VerticalText("GeoGebra", (6, 6)) creates the LaTeX text "GeoGebra" displayed vertically, with its top left corner at (6,6)

## 变换命令

> 共 6 个命令

### Dilate (Enlarge)

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Dilate/>

**语法：**

```
Dilate( <Object>, <Dilation Factor> )
Dilate( <Object>, <Dilation Factor>, <Dilation Center Point> )
```

**说明 / 示例：**

This command differs among variants of English:  
Dilate (US)  
Enlarge (UK + Aus)  
Dilates the object from a point of origin using the given factor.  
Dilates the object from a point, which is the dilation center point, using the given factor.  
When dilating polygons, GeoGebra creates also all the transformed vertices and segments.  
See also  
Dilate from Point by Factor tool.

### Reflect

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Reflect/>

**语法：**

```
Reflect( <Object>, <Point> )
Reflect( <Object>, <Line> )
Reflect( <Object>, <Circle> )
Reflect( <Object>, <Plane> )
```

**说明 / 示例：**

Reflects the geometric object through a given point.  
When reflecting polygons through a point, the transformed vertices and segments are created as well.  
Reflects an object (e.g. an image) across a given line.  
When reflecting polygons across a line, the transformed vertices and segments are created as well.  
Inverts the geometric object with respect to a circle.  
Reflects an object about a plane.  
See also  
Reflect about Point, Reflect about Line,  
Reflect about Plane, and Reflect about Circle tools.

### Rotate

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Rotate/>

**语法：**

```
Rotate( <Object>, <Angle> )
Rotate( <Object>, <Angle>, <Point> )
Rotate( <Object>, <Angle>, <Axis of Rotation>)
Rotate( <Object>, <Angle>, <Point on Axis>, <Axis Direction or Plane> )
```

**说明 / 示例：**

Rotates the geometric object by the angle around the axis origin.  
Rotates the geometric object by the angle around the given point.  
Rotates the geometric object by the angle around the given axis of rotation.  
Rotates the geometric object by the angle around the axis defined by the given point and the axis direction or plane.  
Vectors are not rotated around axis origin, but around their initial point.  
When a polygon, segment, arc, etc. is rotated, also images of the vertices / endpoints and sides (in case of polygon)  
are created.  
This command also rotates images.  
For text rotation use RotateText Command.  
See also  
Rotate around Point and Rotate around Line tools.

### Shear

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Shear/>

**语法：**

```
Shear( <Object>, <Line>, <Ratio> )
```

**说明 / 示例：**

Shears the object so that  
points on the line stay fixed.  
points at distance d from the line are shifted by d (\cdot) ratio in direction of the line (direction of  
the shift is different for halfplanes with respect to the line).  
A sheared plane figure maintains its original area.

### Stretch

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Stretch/>

**语法：**

```
Stretch( <Object>, <Vector> )
Stretch( <Object>, <Line>, <Ratio> )
```

**说明 / 示例：**

The object is stretched parallel to the given vector by the ratio given by the magnitude of the vector (i.e.  
points on the line perpendicular to the vector (through its startpoint) stay on their place and distance of other  
points from the line is multiplied by given ratio.)  
The object is stretched perpendicular to the line by the given ratio (i.e. points on the line aren’t moved and the  
distance of other points from the line is multiplied by given ratio.)

### Translate

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Translate/>

**语法：**

```
Translate( <Object>, <Vector> )
Translate( <Vector>, <Start Point> )
```

**说明 / 示例：**

Translates the geometric object by the vector.  
When translating a polygon, the transformed new vertices and segments are created as well.  
Translates the vector to the start point.  
See also Translate by Vector tool.

## 向量与矩阵命令

> 共 28 个命令

### ApplyMatrix

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/ApplyMatrix/>

**语法：**

```
ApplyMatrix( <Matrix>, <Object> )
```

**说明 / 示例：**

Transforms the object O so that point P of O is mapped to:  
point M*P, if P is a 2D point and M is a 2 x 2 matrix  
point project(M*(x(P), y(P), 1)), if P is a 2D point and M a 3 x 3 matrix: project is a projection, mapping  
point (x, y, z) to (x/z, y/z).  
point M*P, if P is a 3D point and M a 3 x 3 matrix  
point N*P, if P is a 3D point and M a 2 x 2 matrix: the matrix N is the completion or order 3 of M:  
given M = (\begin{pmatrix}a\&b\ c\&d \end{pmatrix}) then N = (\begin{pmatrix}a\&b&0\ c\&d&0\0&0&1  
\end{pmatrix})  
Let M={{cos(π/2),-sin(π/2)}, {sin(π/2), cos(π/2)}} be the transformation matrix and u = (2,1) a given vector  
(object). ApplyMatrix(M,u) yields the vector u'=(-1,2), i.e. the result of a mathematically positive rotation by  
90° of vector u.  
Let M={{1,1,0},{0,1,1},{1,0,1}} be a matrix and u=(2,1) a given vector. ApplyMatrix(M,u) yields vector  
u'=(1,0.67). In effect (\begin{pmatrix}1&1&0\ 0&1&1\1&0&1 \end{pmatrix}) (\begin{pmatrix}2\ 1\1  
\end{pmatrix}) = (\begin{pmatrix}3\ 2\3 \end{pmatrix}), and (3/3 = 1, 2/3 ≈ 0.67) (rounding to 2 decimal  
places)  
This command also works with quadrics and images.

### CharacteristicPolynomial

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/CharacteristicPolynomial/>

**语法：**

```
CharacteristicPolynomial( <Matrix> )
```

**说明 / 示例：**

CAS Syntax  
Returns the characteristic polynomial of the given matrix.  
CharacteristicPolynomial({{1,2},{3,4}}) yields (x^2-5x-2).

### Cross

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Cross/>

**语法：**

```
Cross( <Vector u> , <Vector v> )
```

**说明 / 示例：**

Calculates the cross product of u and v. Instead of vectors you can  
also use lists.  
Cross((1, 3, 2), (0, 3, -2)) yields (-12, 2, 3)  
Cross({1, 1, 1}, {-1, -1, -1}) yields {0, 0, 0}  
For 2D vectors or points the result is the z-coordinate of the actual cross product.  
Cross((1,2),(4,5)) yields -3.  
If a vector in the CAS View contains undefined  
variables, the command yields a formula for the cross product, e.g. Cross((a, b, c), (d, e, f)) yields (b f - c  
e, -a f + c d, a e - b d).  
You can also use the operator u ⊗ v  
See also Dot Command.

### CurvatureVector

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/CurvatureVector/>

**语法：**

```
CurvatureVector( <Point>, <Object> )
```

**说明 / 示例：**

Yields the curvature vector of the object (function, curve, conic) in the given point.  
CurvatureVector((0, 0), x^2) yields vector (0, 2)  
CurvatureVector((0, 0), Curve(cos(t), sin(2t), t, 0, π)) yields vector (0, 0)  
CurvatureVector((-1, 0), Conic({1, 1, 1, 2, 2, 3})) yields vector (0, -2)

### Determinant

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Determinant/>

**语法：**

```
Determinant( <Matrix> )
```

**说明 / 示例：**

Gives the determinant of the matrix.  
Determinant({{1, 2}, {3, 4}}) yields a = -2.  
CAS Syntax  
Gives the determinant of the matrix. If the matrix contains undefined variables, it yields a formula for the  
determinant.  
Determinant({{1, a}, {b, 4}}) yields -a b + 4.

### Dimension

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Dimension/>

**语法：**

```
Dimension( <Object> )
```

**说明 / 示例：**

Gives the dimension of a vector or a matrix.  
Dimension({1, 2, 0, -4, 3}) yields 5.  
Dimension({{1, 2}, {3, 4}, {5, 6}}) yields {3, 2}.  
CAS Syntax  
Gives the dimension of a vector or matrix.  
Dimension({1, 2, 0, -4, 3}) yields 5.  
Dimension({{a, b}, {c, d}, {e, f}}) yields {3, 2}.

### Direction

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Direction/>

**语法：**

```
Direction( <Line> )
```

**说明 / 示例：**

Yields the direction vector of the line.  
Direction(-2x + 3y + 1 = 0) yields the vector (u= \begin{pmatrix} 3 \ 2 \end{pmatrix} )  
A line with equation ax + by = c has the direction vector (b, - a).

### Dot

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Dot/>

**语法：**

```
Dot( <Vector or List>, <Vector or List> )
```

**说明 / 示例：**

Returns the dot product (scalar product) of the two vectors or lists.  
Both Dot((1, 3, 2), (0, 3, -2)) and Dot({1, 3, 2}, {0, 3, -2})  
yield 5, the scalar product of (1, 3, 2) and (0, 3, -2).  
Dot({1, 2}, {2, 3}) yields 8.  
See also Cross Command.

### Eigenvalues

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Eigenvalues/>

**语法：**

```
Eigenvalues( <Matrix> )
```

**说明 / 示例：**

CAS Syntax  
Finds the eigenvalues of the given matrix.  
Eigenvalues({{1, 2}, {3, 4}}) yields ( \left{ \frac{\sqrt{33} + 5}{2}, \frac{-\sqrt{33} + 5}{2}  
\right} )  
See also Eigenvectors Command, SVD Command,  
Invert Command, Transpose Command,  
JordanDiagonalization Command

### Eigenvectors

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Eigenvectors/>

**语法：**

```
Eigenvectors( <Matrix> )
```

**说明 / 示例：**

CAS Syntax  
Finds the eigenvectors of the given matrix.  
Eigenvectors({{1, 2}, {3, 4}}) yields ( \left(\begin{array}{}\sqrt{33} - 3&-\sqrt{33} -  
3\6&6\\\end{array}\right) )  
See also Eigenvalues Command, SVD Command,  
Invert Command, Transpose Command,  
JordanDiagonalization Command

### Element

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Element/>

**语法：**

```
Element( <List>, <Position of Element n> )
Element( <Matrix>, <Row>, <Column> )
Element( <List>, <Index1>, <Index2>, …)
```

**说明 / 示例：**

Yields the nth element of the list.  
Element({1, 3, 2}, 2) yields 3, the second element of {1, 3, 2}.  
In the CAS View undefined  
variables can be used as well.  
Element({a, b, c}, 2) yields b, the second element of {a, b, c}.  
Yields the element of the matrix in the given row and column.  
Element({{1, 3, 2}, {0, 3, -2}}, 2, 3) yields -2, the third element of the second row of  
(\begin{pmatrix}1&3&2\0&3&-2\end{pmatrix}).  
In the CAS View undefined  
variables can be used as well.  
Element({{a, b, c}, {d, e, f}}, 2, 3) yields f, the third element of the second row of  
(\begin{pmatrix}a\&b\&c\d\&e\&f\end{pmatrix}).  
Provided list is n-dimensional list, one can specify up to n indices to obtain an element (or list of elements) at  
given coordinates.  
Let L = {{{1, 2}, {3, 4}}, {{5, 6}, {7, 8}}}.  
Then Element(L, 1, 2, 1) yields 3, Element(L, 2, 2) yields {7, 8}.  
This command only works, if the list or matrix contains elements of one object type (e. g. only numbers or only  
points).  
See also First Command, Last Command and  
RandomElement Command.

### Identity

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Identity/>

**语法：**

```
Identity( <Number> )
```

**说明 / 示例：**

Gives the identity matrix of the given order.  
Identity(3) yields the matrix (\begin{pmatrix}1&0&0\0&1&0\0&0&1\end{pmatrix}).  
If A is a square matrix of order n, A^0 yields the same as Identity(n).

### Invert

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Invert/>

**语法：**

```
Invert( <Matrix> )
Invert( <Function> )
```

**说明 / 示例：**

Inverts the given matrix.  
Invert({{1, 2}, {3, 4}}) yields (\begin{pmatrix}-2 & 1\1.5 & -0.5\end{pmatrix}), the inverse matrix of  
(\begin{pmatrix}1 & 2\3 & 4\end{pmatrix}).  
In the CAS View undefined  
variables are allowed too.  
Invert({{a, b}, {c, d}}) yields (\begin{pmatrix}\frac{d}{ad- bc} & \frac{-b}{ad- bc}\\\frac{-c}{ad-  
bc}& \frac{a}{ad- bc}\end{pmatrix}), the inverse matrix of (\begin{pmatrix}a & b\c & d\end{pmatrix}).  
Gives the inverse of the function.  
Invert(sin(x)) yields asin(x).  
No account is taken of domain or range, for example for f(x) = x2 or f(x) = sin(x).  
The command works faster for functions that only contain one x.  
To make your construction more efficient you may want to rearrange your functions and use eg NInvert((x+1)^2-1) rather than NInvert(x^2+2x).  
See also NInvert Command, Eigenvalues Command, Eigenvectors Command,  
SVD Command, Transpose Command, JordanDiagonalization Command

### JordanDiagonalization

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/JordanDiagonalization/>

**语法：**

```
JordanDiagonalization( <Matrix> )
```

**说明 / 示例：**

This command differs among variants of English:  
JordanDiagonalization (US)  
JordanDiagonalisation (UK + Aus)  
CAS Syntax  
Decomposes the given matrix into the form S J S⁻¹ where J is in  
Jordan Canonical Form  
JordanDiagonalization({{1, 2}, {3, 4}}) yields ( \left(\begin{array}{}\sqrt{33} - 3&-\sqrt{33} -  
3\6&6\\\end{array}\right) ), ( \left(\begin{array}{}\frac{\sqrt{33} + 5}{2}&0\0&\frac{-\sqrt{33} +  
5}{2}\\\end{array}\right) )  
See also Eigenvalues Command, Eigenvectors Command,  
SVD Command, Invert Command,  
Transpose Command

### Length

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Length/>

**语法：**

```
Length( <Object> )
Length( <Vector> ) yields the length of the vector.
Length( <Point> ) yields the length of the position vector of the given point.
Length( <List> ) yields the length of the list, which is the number of elements in the list.
Length( <Text> ) yields the number of characters in the text.
Length( <Locus> ) returns the number of points that the given locus is made up of. Use
Length( <Arc> ) returns the arc length (i.e. just the length of the curved section) of an arc or sector.
Length( <Function>, <Start x-Value>, <End x-Value> )
Length( <Function>, <Start Point>, <End Point> )
Length( <Curve>, <Start t-Value>, <End t-Value> )
Length( <Curve>, <Start Point>, <End Point> )
Length( <Function>, <Variable>, <Start x-Value>, <End x-Value> )
```

**说明 / 示例：**

Yields the length of the object.  
Perimeter(Locus) to get the length of the locus itself. For details see the article about  
First Command.  
Yields the length of the function graph in the given interval.  
Length(2x, 0, 1) returns 2.236067977, about (\sqrt{5}).  
Yields the length of the function graph between the two points.  
If the given points do not lie on the function graph, their x‐coordinates are used to determine the interval.  
Yields the length of the curve between the two values of the parameter.  
Yields the length of the curve between the two points that lie on the curve.  
CAS Syntax  
Calculates the length of a function graph between the two points.  
Length(2 x, 0, 1) yields (\sqrt{5}).  
Calculates the length of a function graph from Start x-value to End x-value.  
Length(2 a, a, 0, 1) yields (\sqrt{5}).  
See also  
Distance or Length tool.

### LUDecomposition

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/LUDecomposition/>

**语法：**

```
LUDecomposition( <Matrix> )
```

**说明 / 示例：**

CAS Syntax  
Calculates the LU decomposition of the given matrix.  
LUDecomposition({{2,0},{1,1}}) returns the matrices  
(\begin{pmatrix}0&1\1&0\end{pmatrix}),(\begin{pmatrix}1&0\2&1\end{pmatrix}) and  
(\begin{pmatrix}1&1\0&-2\end{pmatrix}).  
See also QRDecomposition command.

### MatrixRank

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/MatrixRank/>

**语法：**

```
MatrixRank( <Matrix> )
```

**说明 / 示例：**

Returns the rank of given matrix.  
MatrixRank({{2, 2}, {1, 1}}) yields 1.  
MatrixRank({{1, 2}, {3, 4}}) yields 2.  
Let A = {{1, 2, 3}, {1, 1, 1}, {2, 2, 2}} be a 3x3-matrix. MatrixRank(A) yields 2.  
Hint: In the CAS View this command also works with undefined variables.  
MatrixRank({{1, 2}, {k*1, k*2}}) yields 1.

### MinimalPolynomial

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/MinimalPolynomial/>

**语法：**

```
MinimalPolynomial( <Matrix> )
```

**说明 / 示例：**

CAS Syntax  
Returns the minimal polynomial of the given matrix.  
MinimalPolynomial({{1,0},{0,1}}) yields (x-1).

### PerpendicularVector

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/PerpendicularVector/>

**语法：**

```
PerpendicularVector( <Line> )
PerpendicularVector( <Segment> )
PerpendicularVector( <Vector> )
PerpendicularVector( <Plane> )
```

**说明 / 示例：**

Returns one of the perpendicular vector to the line.  
Let Line((1, 4), (5, -3)) be the line j. PerpendicularVector(j) yields vector u=(7, 4).  
The components of the perpendicular vector to a line of equation ax + by = c are (a, b).  
Returns one of the perpendicular vector to the segment, having the same length.  
Let Segment((3, 2), (14, 5)) be the segment k. PerpendicularVector(k) yields vector u=(-3, 11).  
Returns one of the perpendicular vector to the given vector.  
Let Vector((-12, 8)) be the vector u. PerpendicularVector(u) yields vector v=(-8, -12).  
If a point is specified in the definition of the line, segment, or vector, the perpendicular vector will originate from that point. Otherwise, the origin will be at (0, 0).  
If point A is (1, 4) and point B is (5, -3), let Line(A, B) be the line i,PerpendicularVector(i) will have its origin at A.  
Let Line((1, 4), (5, -3)) be the line j. PerpendicularVector(j) will have its origin at (0, 0).  
In the CAS View undefined  
variables are allowed as well.  
PerpendicularVector((a, b)) yields the vector {-b, a}.  
Creates a vector orthogonal to the plane, with starting point at (0,0,0).  
PerpendicularVector(xOyPlane) yields the perpendicular vector u=(0, 0, 1) to the xOy plane.  
See also UnitPerpendicularVector Command.

### QRDecomposition

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/QRDecomposition/>

**语法：**

```
QRDecomposition( <Matrix> )
```

**说明 / 示例：**

CAS Syntax  
Calculates the QR decomposition of the given matrix.  
QRDecomposition({{1,2},{3,4}}) returns the matrices  
(\begin{pmatrix}\frac{1}{\sqrt{10}}&\frac{3/5}{\sqrt{10}/5}\\\frac{3}{\sqrt{10}}&-\frac{1/5}{\sqrt{10}/5}\end{pmatrix}) and  
(\begin{pmatrix}\sqrt{10}&7/5\sqrt{10}\0&\sqrt{10}/5\end{pmatrix}).  
See also LUDecomposition command.

### ReducedRowEchelonForm

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/ReducedRowEchelonForm/>

**语法：**

```
ReducedRowEchelonForm( <Matrix> )
```

**说明 / 示例：**

Returns the reduced echelon form of the matrix.  
ReducedRowEchelonForm({{1, 6, 4}, {2, 8, 9}, {4, 5, 6}}) yields the matrix ( \begin{pmatrix} 1 & 0 & 0 \  
0 & 1 & 0 \ 0 & 0 & 1 \end{pmatrix}).  
ReducedRowEchelonForm({{2, 10, 11, 4}, {2, (-5), (-6), 12}, {2, 5, 3, 2}}) yields the matrix (  
\begin{pmatrix} 1 & 0 & 0 & 5\ 0 & 1 & 0 & -2.8\ 0 & 0 & 1 & 2\end{pmatrix}).  
CAS Syntax  
Returns the reduced echelon form of the matrix.  
ReducedRowEchelonForm({{1, 6, 4}, {2, 8, 9}, {4, 5, 6}}) yields the matrix ( \begin{pmatrix} 1 & 0 & 0 \  
0 & 1 & 0 \ 0 & 0 & 1 \end{pmatrix}).  
ReducedRowEchelonForm({{2, 10, 11, 4}, {2, (-5), (-6), 12}, {2, 5, 3, 2}}) yields the matrix (  
\begin{pmatrix} 1 & 0 & 0 & 5\ 0 & 1 & 0 & \frac{-14}{5} \ 0 & 0 & 1 & 2\end{pmatrix}).

### SVD

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/SVD/>

**语法：**

```
SVD( <Matrix> )
```

**说明 / 示例：**

Returns the Singular Value Decomposition of the matrix (as  
a list of 3 matrices).  
SVD({{3, 1, 1}, {-1, 3, 1}}) yields a list containing (  
\left(\begin{array}{rr}-0.71&0.71\0.71&0.71\\\end{array}\right) ), (  
\left(\begin{array}{rr}3.16&0\0&3.46\\\end{array}\right)),  
(\left(\begin{array}{rr}-0.89&0.41\0.45&0.82\0&0.41\\\end{array}\right)).  
This command is also supported in the  
CAS View. The numbers in the answer may vary in order between the  
Algebra View and  
CAS View.  
See also Eigenvalues Command, Eigenvectors Command,  
Invert Command, Transpose Command,  
JordanDiagonalization Command

### ToComplex

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/ToComplex/>

**语法：**

```
ToComplex( <Vector> )
```

**说明 / 示例：**

Transforms a vector or point to a complex number in algebraic form.  
ToComplex((3, 2)) yields 3 + 2ί.  
CAS Syntax  
Transforms a vector or point to a complex number in algebraic form.  
ToComplex((3, 2)) yields 3 + 2ί.  
The complex ί is obtained by pressing ALT + i.  
See also ToExponential Command, ToPoint Command and  
ToPolar Command.

### ToPolar

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/ToPolar/>

**语法：**

```
ToPolar( <Vector> )
ToPolar( <Complex Number> )
```

**说明 / 示例：**

Transforms a vector into its polar coordinates.  
ToPolar({1, sqrt(3)}) yields (2; 60°) in the Algebra View and (2; (\frac{\pi}{3})) in the  
CAS View.  
Transforms a complex number into its polar coordinates.  
ToPolar(1 + sqrt(3) * ί) yields (2; 60°) in the Algebra View and (2; (\frac{\pi}{3})) in the  
CAS View.  
The complex ί is obtained by pressing ALT + i.  
See also ToComplex Command, ToExponential Command  
and ToPoint Command.

### Transpose

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Transpose/>

**语法：**

```
Transpose( <Matrix> )
```

**说明 / 示例：**

Transposes the matrix.  
Transpose({{1, 2, 3}, {4, 5, 6}, {7, 8, 9}}) yields the matrix (\begin{pmatrix}1&4&7\ 2&5&8\  
3&6&9\end{pmatrix}).  
CAS Syntax  
Transposes the matrix.  
Transpose({{a, b}, {c, d}}) yields the matrix(\begin{pmatrix}a\&c\b\&d\end{pmatrix}).  
See also Eigenvalues Command, Eigenvectors Command,  
SVD Command, Invert Command,  
JordanDiagonalization Command

### UnitPerpendicularVector

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/UnitPerpendicularVector/>

**语法：**

```
UnitPerpendicularVector( <Line>)
UnitPerpendicularVector( <Segment> )
UnitPerpendicularVector( <Vector> )
UnitPerpendicularVector( <Plane> )
```

**说明 / 示例：**

Returns the perpendicular vector with length 1 of the given line.  
UnitPerpendicularVector(3x + 4y = 5) yields (\begin{pmatrix}0.6\0.8\end{pmatrix}).  
Returns the perpendicular vector with length 1 of the given segment.  
Let s = Segment((1,1), (4,5)).  
UnitPerpendicularVector(s) yields (\begin{pmatrix}-0.8\0.6\end{pmatrix}).  
Returns the perpendicular vector with length 1 of the given vector. The vector must be defined first.  
Let v=(\begin{pmatrix}3\4\end{pmatrix}). UnitPerpendicularVector(v) yields  
(\begin{pmatrix}-0.8\0.6\end{pmatrix}).  
CAS Syntax  
In the CAS View vectors with  
undefined variables are also valid input.  
UnitPerpendicularVector((a, b)) yields ((\frac{-b}{\sqrt{a^2 +  
b^2}}),(\frac{a}{\sqrt{a^2+ b^2}})).  
Creates a unit vector orthogonal to the plane.  
See also PerpendicularVector Command.

### UnitVector

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/UnitVector/>

**语法：**

```
UnitVector( <Vector> )
UnitVector( <Line> )
UnitVector( <Segment> )
```

**说明 / 示例：**

Yields a vector with length 1, which has the same direction and orientation as the given vector. The vector must be  
defined first.  
Let v=(\begin{pmatrix}3\4\end{pmatrix}). UnitVector(v) yields  
(\begin{pmatrix}0.6\0.8\end{pmatrix}).  
Yields the direction vector of the given line with length 1.  
UnitVector(3x + 4y = 5) yields (\begin{pmatrix}0.8\\-0.6\end{pmatrix}).  
Yields the direction vector of the given segment with length 1.  
Let s = Segment((1,1),(4,5)).  
UnitVector(s) yields (\begin{pmatrix}0.6\0.8\end{pmatrix}).  
Hint: In the CAS View three-dimensional vectors and vectors with undefined variables  
are also valid inputs.  
UnitVector((a, b)) yields ((\frac{a}{\sqrt{a^2 + b^2}}), (\frac{b}{\sqrt{a^2 + b^2}})).  
UnitVector((2, 4, 4)) yields ((\frac{1}{3}), (\frac{2}{3}), (\frac{2}{3})).

### Vector

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Vector/>

**语法：**

```
Vector( <Point> )
Vector( <Start Point>, <End Point> )
```

**说明 / 示例：**

Returns the position vector of the given point.  
Vector((3, 2)) yields u = (\begin{pmatrix}3\2\end{pmatrix}).  
Creates a vector from Start Point to End Point.  
Vector((1, 1), (3, 4)) yields u = (\begin{pmatrix}2\3\end{pmatrix}).  
See also Vector tool.

## CAS 专用命令

> 共 136 个命令

### Assume

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Assume/>

**语法：**

```
Assume( <Condition>, <Expression> )
```

**说明 / 示例：**

CAS Syntax  
Evaluates the expression according to the condition  
Assume(a > 0, Integral(exp(-a x), 0, infinity)) yields 1 / a.  
Assume(x>0 && n>0, Solve(log(n^2*(x/n)^lg(x))=log(x^2), x)) yields {x = 100, x = n}  
Assume(x<2,Simplify(sqrt(x-2sqrt(x-1)))) yields -sqrt(x - 1) + 1  
Assume(x>2,Simplify(sqrt(x-2sqrt(x-1)))) yields sqrt(x - 1) - 1  
Assume(k>0, Extremum(k*3*x^2/4-2*x/2)) yields ( \left{ \left(\frac{2}{3 k}, -\frac{1}{3 k} \right)\right} )  
Assume(k>0, InflectionPoint(0.25 k x^3 - 0.5x^2 + k)) yields ( \left{ \left(\frac{2}{3 k}, \frac{27k^{3} - 4}{27 k^{2}} \right) \right} )  
See also Solve Command.

### BinomialDist

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/BinomialDist/>

**语法：**

```
BinomialDist( <Number of Trials>, <Probability of Success> )
BinomialDist( <Number of Trials>, <Probability of Success>, <Boolean Cumulative> )
BinomialDist( <Number of Trials>, <Probability of Success>, <Variable Value>, <Boolean Cumulative> )
BinomialDist( <Number of Trials>, <Probability of Success>, <List of values>)
```

**说明 / 示例：**

Returns a histogram of a Binomial distribution.  
The parameter Number of Trials specifies the number of independent Bernoulli trials and the parameter Probability  
of Success specifies the probability of success in one trial.  
Returns a histogram of a Binomial distribution when Cumulative = false.  
Returns a graph of a cumulative Binomial distribution when Cumulative = true.  
First two parameters are same as above.  
Let X be a Binomial random variable and let v be the variable value.  
Returns P( X = v) when Cumulative = false.  
Returns P( X ≤ v) when Cumulative = true.  
First two parameters are same as above.  
Calculates P(u ≤ X ≤ v) by applying the previous syntax (with Cumulative = false) and adding the values obtained when the elements of the List of values are used as variable values.  
BinomialDist(10, 0.2, {1,2,3}) yields 0.77175, and is equivalent to BinomialDist(10, 0.2, 1, false) + BinomialDist(10, 0.2, 2, false) + BinomialDist(10, 0.2, 3, false)  
The syntaxes BinomialDist(10, 0.2, {1,2,3}) and BinomialDist(10, 0.2, 1..3) are equivalent.  
CAS Syntax  
Let X be a Binomial random variable and let v be the variable value.  
Returns P( X = v) when Cumulative = false.  
Returns P( X ≤ v) when Cumulative = true.  
You can plot a graph with eg f(x):=BinomialDist(100,x,36,true)-BinomialDist(100,x,23,true)  
Assume transferring three packets of data over a faulty line. The chance an arbitrary packet transferred over this line  
becomes corrupted is (\frac{1}{10}), hence the probability of transferring an arbitrary packet successfully is  
(\frac{9}{10}).  
BinomialDist(3, 0.9, 0, false) yields (\frac{1}{1000}), the probability of none of the three packets  
being transferred successfully.  
BinomialDist(3, 0.9, 1, false) yields (\frac{27}{1000}), the probability of exactly one of three  
packets being transferred successfully.  
BinomialDist(3, 0.9, 2, false) yields (\frac{243}{1000}), the probability of exactly two of three  
packets being transferred successfully.  
BinomialDist(3, 0.9, 3, false) yields (\frac{729}{1000}), the probability of all three packets being  
transferred successfully.  
BinomialDist(3, 0.9, 0, true) yields (\frac{1}{1000}), the probability of none of the three packets  
being transferred successfully.  
BinomialDist(3, 0.9, 1, true) yields (\frac{7}{250}), the probability of at most one of three packets  
being transferred successfully.  
BinomialDist(3, 0.9, 2, true) yields (\frac{271}{1000}), the probability of at most two of three  
packets being transferred successfully.  
BinomialDist(3, 0.9, 3, true) yields 1, the probability of at most three of three packets being transferred  
successfully.  
BinomialDist(3, 0.9, 4, false) yields 0, the probability of exactly four of three packets being transferred  
successfully.  
BinomialDist(3, 0.9, 4, true) yields 1, the probability of at most four of three packets being transferred  
successfully.  
Calculates P(u ≤ X ≤ v) by applying the previous syntax (with Cumulative = false) and adding the values obtained when the elements of the List of values are used as variable values.  
BinomialDist(10, 0.2, {1,2,3}) yields (\frac{1507328}{1953125}), and is equivalent to BinomialDist(10, 0.2, 1, false) + BinomialDist(10, 0.2, 2, false) + BinomialDist(10, 0.2, 3, false)

### CFactor

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/CFactor/>

**语法：**

```
CFactor( <Expression> )
CFactor( <Expression>, <Variable> )
```

**说明 / 示例：**

This command differs among variants of English:  
CFactor (US)  
CFactorise (UK + Aus)  
CAS Syntax  
Factorizes a given expression, allowing for complex factors.  
CFactor(x^2 + 4) yields (x + 2 ί) (x - 2 ί), the factorization of x2 + 4.  
Factorizes an expression with respect to a given variable, allowing for complex factors.  
CFactor(a^2 + x^2, a) yields (ί x + a) (- ί x + a), the factorization of a2 + x2 with respect to a.  
CFactor(a^2 + x^2, x) yields (x + ί a) (x - ί a), the factorization of a2 + x2 with respect to x.  
This command factors expressions over the Complex Rational Numbers. To  
factor over rational numbers, see the Factor Command.

### CIFactor

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/CIFactor/>

**语法：**

```
CIFactor( <Expression> )
CIFactor( <Expression>, <Variable> )
```

**说明 / 示例：**

CAS Syntax  
Factors over the complex irrationals.  
CIFactor(x^2 + x + 1) returns ( \left( x + \frac{-ί \sqrt{3} + 1}{2} \right) \left( x + \frac{ί \sqrt{3}

- 1}{2} \right))    
  Factors over the complex irrationals with respect to a given variable.    
  CIFactor(a^2 + a + 1, a) returns ( \left( a + \frac{-ί \sqrt{3} + 1}{2} \right) \left( a + \frac{ί    
  \sqrt{3} + 1}{2} \right))    
  See also IFactor command.

### CSolutions

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/CSolutions/>

**语法：**

```
CSolutions( <Equation> )
CSolutions( <Equation>, <Variable> )
CSolutions( <List of Equations>, <List of Variables> )
```

**说明 / 示例：**

CAS Syntax  
Solves a given equation for the main variable and returns a list of all solutions, allowing for complex solutions.  
CSolutions(x^2 = -1) yields {ί, -ί}, the complex solutions of x2 = -1.  
Solves an equation for a given unknown variable and returns a list of all solutions, allowing for complex solutions.  
CSolutions(a^2 = -1, a) yields {ί, -ί}, the complex solutions of a2 = -1.  
Solves a set of equations for a given set of unknown variables and returns a list of all solutions, allowing for  
complex solutions.  
CSolutions({y^2 = x - 1, x = 2 * y - 1}, {x, y}) yields (\begin{pmatrix}1 + 2 ί&1 + ί\1 - 2 ί&1 -  
ί\end{pmatrix}), the complex solutions of y2 = x - 1 and x = 2 * y - 1.  
The complex ί is obtained by pressing ALT + i.  
See also CSolve Command and Solutions Command.

### CSolve

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/CSolve/>

**语法：**

```
CSolve( <Equation> )
CSolve( <Equation>, <Variable> )
CSolve( <List of Equations>, <List of Variables> )
```

**说明 / 示例：**

CAS Syntax  
Solves a given equation for the main variable and returns a list of all solutions, allowing for complex solutions.  
CSolve(x^2 = -1) yields {x = ί, x = -ί}, the complex solutions of x2 = -1.  
Solves an equation for a given unknown variable and returns a list of all solutions, allowing for complex solutions.  
CSolve(a^2 = -1, a) yields {a = ί, a = -ί}, the complex solutions of a2 = -1.  
Solves a set of equations for a given set of unknown variables and returns a list of all solutions, allowing for  
complex solutions.  
CSolve({y^2 = x - 1, x = 2 * y - 1}, {x, y}) yields {{x = 1 - 2 ί, y = 1 - ί}, {x = 1 + 2 ί, y = 1 + ί}}, the  
complex solutions of y2 = x - 1 and x = 2 * y - 1.  
The complex ί is obtained by pressing ALT + i.  
See also CSolutions Command and Solve Command.

### Cauchy

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Cauchy/>

**语法：**

```
Cauchy( <Median>, <Scale>, <Variable value> )
Cauchy( <Median>, <Scale>, <Variable value>, <Boolean Cumulative>)
Cauchy( <Median>, <Scale>, x, <Boolean Cumulative>)
```

**说明 / 示例：**

Calculates the value of the cumulative density function (cdf) at the given variable value v of a Cauchy distribution, that is the probability P(X≤v) where X is a random variable of a Cauchy distribution of given parameters median and scale.  
Cauchy(1, 2, 3) yields 0.75 in the Algebra View and (\frac{3}{4}) in the  
CAS View.  
This syntax returns the probability for a given value, that is the area under the Cauchy distribution curve to the left of the given x-coordinate.  
If Cumulative is true, calculates the value of a cumulative distribution function of a Cauchy distribution at variable value, otherwise it calculates the value of the probability density function (pdf) at variable value of the given Cauchy distribution of parameters median and scale.  
If Cumulative is true, creates the cumulative distribution function of a Cauchy distribution, otherwise creates the probability density function of the given Cauchy distribution of parameters median and scale.

### ChiSquared

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/ChiSquared/>

**语法：**

```
ChiSquared( <Degrees of Freedom>, <Variable Value> )
ChiSquared( <Degrees of Freedom>, <Variable Value>, <Boolean Cumulative> )
ChiSquared( <Degrees of Freedom>, x, <Boolean Cumulative> )
```

**说明 / 示例：**

Calculates the value of the cumulative distribution function of a Chi squared distribution at variable value v, i.e. the  
probability P(X ≤ v) where X is a random variable with a Chi squared distribution with the given degrees of freedom.  
ChiSquared(4, 3) yields (\gamma\left(2, \frac{3}{2}\right)), which is approximately 0.44.  
This syntax returns the probability at a given x-coordinate’s value, that is the area under the Chi squared distribution curve to the left of the given x-coordinate.  
If Cumulative = true, calculates the value of the cumulative distribution function of a Chi squared distribution with given degrees of freedom at the given variable value, otherwise it calculates the probability density function of the distribution at variable value.  
If Cumulative = true, creates the cumulative density function (cdf) of a Chi squared  
distribution with the given degrees of freedom, otherwise it creates the probability density function (pdf) of the distribution.

### CharacteristicPolynomial

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/CharacteristicPolynomial/>

**语法：**

```
CharacteristicPolynomial( <Matrix> )
```

**说明 / 示例：**

CAS Syntax  
Returns the characteristic polynomial of the given matrix.  
CharacteristicPolynomial({{1,2},{3,4}}) yields (x^2-5x-2).

### Coefficients

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Coefficients/>

**语法：**

```
Coefficients( <Polynomial> )
Coefficients( <Conic> )
Coefficients( <Polynomial>, <Variable> )
```

**说明 / 示例：**

Yields the list of all coefficients (a_k,a\_{k-1},\ldots,a_1, a_0) of the polynomial  
(a_k x^k+a\_{k-1}x^{k-1}+\cdots+a_1 x+a_0).  
Coefficients(x^3 - 3 x^2 + 3 x) yields {1, -3, 3, 0}.  
For non-polynomial curves obtained using one the fitting commands e.g. f(x) = FitExp(l1), the command  
Coefficients(f) will return the list of the calculated parameters.  
Returns the list of the coefficients a, b, c, d, e, f of a conic in standard form: (a\cdot x^2 + b\cdot  
y^2 + c + d\cdot x\cdot y + e\cdot x + f\cdot y = 0)  
For a line in implicit form l: ax + by + c = 0 it is possible to obtain the coefficients using the syntax x(l),  
y(l), z(l).  
Given line l: 3x + 2y - 2 = 0:  
x(l) returns 3  
y(l) returns 2  
z(l) returns -2  
CAS Syntax  
Yields the list of all coefficients of the polynomial in the main variable.  
Coefficients(x^3 - 3 x^2 + 3 x) yields {1, -3, 3, 0}.  
Yields the list of all coefficients of the polynomial in the given variable.  
Coefficients(a^3 - 3 a^2 + 3 a, a) yields {1, -3, 3, 0}.  
Coefficients(a^3 - 3 a^2 + 3 a, x) yields {a³ - 3 a² + 3 a}.

### CommonDenominator

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/CommonDenominator/>

**语法：**

```
CommonDenominator( <Expression>, <Expression> )
```

**说明 / 示例：**

Returns the function having as equation the lowest common denominator of the two expressions.  
CommonDenominator(3 / (2 x + 1), 3 / (4 x^2 + 4 x + 1)) yields f(x) = 4 x2 + 4 x + 1.  
CAS Syntax  
Returns the lowest common denominator of the two expressions.  
CommonDenominator(3 / (2 x + 1), 3 / (4 x^2 + 4 x + 1)) yields 4 x2 + 4 x + 1.

### CompleteSquare

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/CompleteSquare/>

**语法：**

```
CompleteSquare( <Quadratic Function> )
```

**说明 / 示例：**

Returns the quadratic function in the form: (a (x - h)^2 + k).  
CompleteSquare(x^2 - 4x + 7) yields 1 (x - 2)2 + 3.  
CAS Syntax  
Returns the quadratic function in the form: (a(x-h)^2+k).  
CompleteSquare(x^2 - 4x + 7) yields (x - 2)2 + 3.

### ComplexRoot

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/ComplexRoot/>

**语法：**

```
ComplexRoot( <Polynomial> )
```

**说明 / 示例：**

Finds the complex roots of a given polynomial in x. Points are created in Graphics View.  
ComplexRoot(x^2 + 4) yields (0 + 2 ί) and (0 - 2 ί)  
CAS Syntax  
Finds the complex roots of a given polynomial in x.  
ComplexRoot(x^2 + 4) yields {- 2 ί, 2 ί}  
Use CSolve Command instead.

### Covariance

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Covariance/>

**语法：**

```
Covariance( <List of Numbers>, <List of Numbers> )
Covariance( <List of Points> )
```

**说明 / 示例：**

Calculates the covariance between the elements of the specified lists.  
Covariance({1, 2, 3}, {1, 3, 7}) yields 2, the covariance of {1, 2, 3} and {1, 3, 7}.  
Calculates the covariance between the x and y coordinates of the specified points.  
Covariance({(1, 1), (2, 3), (3, 7)}) yields 2, the covariance of {1, 2, 3} and {1, 3, 7}.

### Cross

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Cross/>

**语法：**

```
Cross( <Vector u> , <Vector v> )
```

**说明 / 示例：**

Calculates the cross product of u and v. Instead of vectors you can  
also use lists.  
Cross((1, 3, 2), (0, 3, -2)) yields (-12, 2, 3)  
Cross({1, 1, 1}, {-1, -1, -1}) yields {0, 0, 0}  
For 2D vectors or points the result is the z-coordinate of the actual cross product.  
Cross((1,2),(4,5)) yields -3.  
If a vector in the CAS View contains undefined  
variables, the command yields a formula for the cross product, e.g. Cross((a, b, c), (d, e, f)) yields (b f - c  
e, -a f + c d, a e - b d).  
You can also use the operator u ⊗ v  
See also Dot Command.

### Degree

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Degree/>

**语法：**

```
Degree( <Polynomial> )
Degree( <Polynomial>, <Variable> )
```

**说明 / 示例：**

Gives the degree of a polynomial (in the main variable).  
Degree(x^4 + 2 x^2) yields 4  
CAS Syntax  
Gives the degree of a polynomial (in the main variable or  
monomial).  
Degree(x^4 + 2 x^2) yields 4  
Degree(x^6 y^3 + 2 x^2 y^3) yields 9  
Gives the degree of a polynomial in the given variable.  
Degree(x^4 y^3 + 2 x^2 y^3, x) yields 4  
Degree(x^4 y^3 + 2 x^2 y^3, y) yields 3

### Delete

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Delete/>

**语法：**

```
Delete( <Object> )
```

**说明 / 示例：**

Deletes the object and all its dependent objects.  
Let P be a point, sli a slider, and seg=Segment(P, sli). The command Delete(sli) deletes the slider sli and the segment seg, but doesn’t delete point P from the construction, since the point does not depend on the slider sli.  
CAS Syntax  
Deletes the object and all its dependent objects in GeoGebra and removes any value assigned to the object in the CAS View.  
Let P be a point, sli a slider, and seg=Segment(P,sli). The command Delete(sli) deletes the slider sli and the segment seg, but doesn’t delete point P from the construction, since the point does not depend on the slider sli.  
See also Delete tool.

### Denominator

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Denominator/>

**语法：**

```
Denominator( <Function> )
Denominator( <Number> )
Denominator( <Expression> )
```

**说明 / 示例：**

Returns the denominator of a function.  
Denominator(5 / (x^2 + 2)) yields f(x)=(x2 + 2).  
For a rational number returns its (simplified) denominator. It uses a numerical method, which limits this command to numbers with  
small denominator. For irrational input the denominator of its continued  
fraction is returned.  
Denominator(5 / 3) yields 3.  
Denominator(10 / 6) yields 3.  
Denominator(15 / 3) yields 1.  
See also Numerator Command and FractionText Command.  
CAS Syntax  
Returns the denominator of a rational number or expression.  
Denominator(2 / 3 + 1 / 15) yields 15.

### Derivative

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Derivative/>

**语法：**

```
Derivative( <Function> )
Derivative( <Function>, <Number> )
Derivative( <Function>, <Variable> )
Derivative( <Function>, <Variable>, <Number> )
Derivative( <Curve> )
Derivative( <Curve>, <Number> )
Derivative( <Expression> )
Derivative( <Expression>, <Variable> )
Derivative( <Expression>, <Variable>, <Number> )
```

**说明 / 示例：**

Returns the derivative of the function with respect to the main variable.  
Derivative(x^3 + x^2 + x) yields 3x² + 2x + 1.  
Returns the nth derivative of the function with respect to the main variable, whereupon n equals <Number>.  
Derivative(x^3 + x^2 + x, 2) yields 6x + 2.  
Returns the partial derivative of the function with respect to the given variable.  
Derivative(x^3 y^2 + y^2 + xy, y) yields 2x³y + x + 2y.  
Returns the nth partial derivative of the function with respect to the given variable, whereupon n equals  
<Number>.  
Derivative(x^3 + 3x y, x, 2) yields 6x.  
Returns the derivative of the curve.  
Derivative(Curve(cos(t), t sin(t), t, 0, π)) yields curve x = -sin(t), y = sin(t) + t cos(t).  
This only works for parametric curves.  
Returns the nth derivative of the curve, whereupon n equals <Number>.  
Derivative(Curve(cos(t), t sin(t), t, 0, π), 2) yields curve x = -cos(t), y = 2cos(t) - t sin(t).  
This only works for parametric curves.  
You can use f'(x) instead of Derivative(f), or f''(x) instead of Derivative(f, 2), and so on.  
CAS Syntax  
Returns derivative of an expression with respect to the main variable.  
Derivative(x^2) yields 2x.  
Returns derivative of an expression with respect to the given variable.  
Derivative(a x^3, a) yields x³.  
Returns the nth derivative of an expression with respect to the given variable, whereupon n equals <Number>.  
Derivative(y x^3, x, 2) yields 6xy.  
Derivative(x³ + 3x y, x, 2) yields 6x.

### Determinant

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Determinant/>

**语法：**

```
Determinant( <Matrix> )
```

**说明 / 示例：**

Gives the determinant of the matrix.  
Determinant({{1, 2}, {3, 4}}) yields a = -2.  
CAS Syntax  
Gives the determinant of the matrix. If the matrix contains undefined variables, it yields a formula for the  
determinant.  
Determinant({{1, a}, {b, 4}}) yields -a b + 4.

### Dimension

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Dimension/>

**语法：**

```
Dimension( <Object> )
```

**说明 / 示例：**

Gives the dimension of a vector or a matrix.  
Dimension({1, 2, 0, -4, 3}) yields 5.  
Dimension({{1, 2}, {3, 4}, {5, 6}}) yields {3, 2}.  
CAS Syntax  
Gives the dimension of a vector or matrix.  
Dimension({1, 2, 0, -4, 3}) yields 5.  
Dimension({{a, b}, {c, d}, {e, f}}) yields {3, 2}.

### Div

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Div/>

**语法：**

```
Div( <Dividend Number>, <Divisor Number> )
Div( <Dividend Polynomial>, <Divisor Polynomial> )
```

**说明 / 示例：**

Returns the quotient (integer part of the result) of the two numbers.  
Div(16, 3) yields 5.  
Returns the quotient of the two polynomials.  
Div(x^2 + 3 x + 1, x - 1) yields f(x) = x + 4.

### Division

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Division/>

**语法：**

```
Division( <Dividend Number>, <Divisor Number> )
Division( <Dividend Polynomial>, <Divisor Polynomial> )
```

**说明 / 示例：**

Gives the quotient (integer part of the result) and the remainder of the division of the two numbers.  
Division(16, 3) yields {5, 1}.  
Gives the quotient and the remainder of the division of the two polynomials.  
Division(x^2 + 3 x + 1, x - 1) yields {x + 4, 5}.  
In the Algebra View only one variable can be used and it will always be renamed to x. In the CAS View  
multivariable division is also supported.  
Division(x^2+y^2, x+y) yields {x - y, 2y^2}.  
Division(x^2+y^2, y+x) yields {y - x, 2x^2}.

### Divisors

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Divisors/>

**语法：**

```
Divisors( <Number> )
```

**说明 / 示例：**

Calculates the number of all the positive divisors, including the number itself.  
Divisors(15) yields 4, the number of all positive divisors of 15, including 15.  
CAS Syntax  
Calculates the number of all the positive divisors, including the number itself.  
Divisors(15) yields 4, the number of all positive divisors of 15, including 15.  
See also DivisorsList Command and DivisorsSum  
Command.

### DivisorsList

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/DivisorsList/>

**语法：**

```
DivisorsList( <Number> )
```

**说明 / 示例：**

Gives the list of all the positive divisors, including the number itself.  
DivisorsList(15) yields {1, 3, 5, 15}, the list of all positive divisors of 15, including 15.  
CAS Syntax  
Gives the list of all the positive divisors, including the number itself.  
DivisorsList(15) yields {1, 3, 5, 15}, the list of all positive divisors of 15, including 15.  
See also Divisors Command and DivisorsSum Command.

### DivisorsSum

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/DivisorsSum/>

**语法：**

```
DivisorsSum( <Number> )
```

**说明 / 示例：**

Calculates the sum of all the positive divisors, including the number itself.  
DivisorsSum(15) yields 24, the sum 1 + 3 + 5 + 15.  
CAS Syntax  
Calculates the sum of all the positive divisors, including the number itself.  
DivisorsSum(15) yields 24, the sum 1 + 3 + 5 + 15.  
See also Divisors Command and DivisorsList Command.

### Dot

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Dot/>

**语法：**

```
Dot( <Vector or List>, <Vector or List> )
```

**说明 / 示例：**

Returns the dot product (scalar product) of the two vectors or lists.  
Both Dot((1, 3, 2), (0, 3, -2)) and Dot({1, 3, 2}, {0, 3, -2})  
yield 5, the scalar product of (1, 3, 2) and (0, 3, -2).  
Dot({1, 2}, {2, 3}) yields 8.  
See also Cross Command.

### Eigenvalues

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Eigenvalues/>

**语法：**

```
Eigenvalues( <Matrix> )
```

**说明 / 示例：**

CAS Syntax  
Finds the eigenvalues of the given matrix.  
Eigenvalues({{1, 2}, {3, 4}}) yields ( \left{ \frac{\sqrt{33} + 5}{2}, \frac{-\sqrt{33} + 5}{2}  
\right} )  
See also Eigenvectors Command, SVD Command,  
Invert Command, Transpose Command,  
JordanDiagonalization Command

### Eigenvectors

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Eigenvectors/>

**语法：**

```
Eigenvectors( <Matrix> )
```

**说明 / 示例：**

CAS Syntax  
Finds the eigenvectors of the given matrix.  
Eigenvectors({{1, 2}, {3, 4}}) yields ( \left(\begin{array}{}\sqrt{33} - 3&-\sqrt{33} -  
3\6&6\\\end{array}\right) )  
See also Eigenvalues Command, SVD Command,  
Invert Command, Transpose Command,  
JordanDiagonalization Command

### Element

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Element/>

**语法：**

```
Element( <List>, <Position of Element n> )
Element( <Matrix>, <Row>, <Column> )
Element( <List>, <Index1>, <Index2>, …)
```

**说明 / 示例：**

Yields the nth element of the list.  
Element({1, 3, 2}, 2) yields 3, the second element of {1, 3, 2}.  
In the CAS View undefined  
variables can be used as well.  
Element({a, b, c}, 2) yields b, the second element of {a, b, c}.  
Yields the element of the matrix in the given row and column.  
Element({{1, 3, 2}, {0, 3, -2}}, 2, 3) yields -2, the third element of the second row of  
(\begin{pmatrix}1&3&2\0&3&-2\end{pmatrix}).  
In the CAS View undefined  
variables can be used as well.  
Element({{a, b, c}, {d, e, f}}, 2, 3) yields f, the third element of the second row of  
(\begin{pmatrix}a\&b\&c\d\&e\&f\end{pmatrix}).  
Provided list is n-dimensional list, one can specify up to n indices to obtain an element (or list of elements) at  
given coordinates.  
Let L = {{{1, 2}, {3, 4}}, {{5, 6}, {7, 8}}}.  
Then Element(L, 1, 2, 1) yields 3, Element(L, 2, 2) yields {7, 8}.  
This command only works, if the list or matrix contains elements of one object type (e. g. only numbers or only  
points).  
See also First Command, Last Command and  
RandomElement Command.

### Eliminate

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Eliminate/>

**语法：**

```
Eliminate( <List of Polynomials>, <List of Variables> )
```

**说明 / 示例：**

CAS Syntax  
Considers the algebraic equation system defined by the polynomials, and computes an equivalent system after  
eliminating all variables in the given list.  
Eliminate({x^2 + x, y^2 - x}, {x}) yields {( y^{4} + y^{2} )}.  
See also GroebnerLexDeg command.

### Expand

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Expand/>

**语法：**

```
Expand( <Expression> )
```

**说明 / 示例：**

Expands the expression.  
Expand((2 x - 1)^2 + 2 x + 3) yields (4 x^2 - 2 x + 4).  
This command needs to load the Computer Algebra System, so can be slow on some computers. Try using the  
Polynomial Command instead.  
CAS Syntax  
Expands the expression.  
Expand((2 x - 1)^2 + 2 x + 3) yields (4 x^2 - 2 x + 4).

### Exponential

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Exponential/>

**语法：**

```
Exponential( <Lambda>, <Variable Value> )
Exponential( <Lambda>, <Variable Value>, <Boolean Cumulative> )
Exponential( <Lambda>, x, <Boolean Cumulative> )
```

**说明 / 示例：**

Calculates the value of the cumulative distribution function of an Exponential distribution at variable value v, i.e. the  
probability P(X ≤ v) where X is a random variable with an Exponential  
distribution defined by the parameter lambda.  
This syntax returns the probability at a given value, that is the area under the Exponential distribution curve to the left of the given x-coordinate.  
If Cumulative = true, calculates the value of the cumulative distribution function of an Exponential distribution with given lambda parameter at the given variable value, otherwise it calculates the probability density function of the distribution at variable value.  
If Cumulative = true, creates the cumulative density function (cdf) of an Exponential distribution with given lambda, otherwise it creates the probability density function (pdf) of the distribution.  
CAS Syntax  
Calculates the value of the cumulative distribution function of an Exponential distribution at variable value v, i.e. the  
probability P(X ≤ v) where X is a random variable with Exponential distribution with parameter lambda.  
Exponential(2, 1) yields (1 - \frac{1}{e^{2} } ), which is approximately 0.86.

### ExtendedGCD

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/ExtendedGCD/>

**语法：**

```
ExtendedGCD( <Integer>,<Integer> )
ExtendedGCD( <Polynomial>, <Polynomial> )
```

**说明 / 示例：**

CAS Syntax  
Returns a list containing the integer coefficients (s, t) of Bézout’s identity (as+bt= GCD(a,b)) and the  
greatest common divisor of the given integers (a) and (b).  
Results are calculated by applying the Extended Euclidean  
algorithm.  
ExtendedGCD(240,46) yields {(-9,47,2)}. (Plugging the result into the Bézout’s identity we have: (-9  
\cdot 240+47 \cdot 46=2)).  
Returns a list containing the polynomial coefficients (S(x), T(x)) of Bézout’s identity for polynomials  
(A(x)S(x) + B(x)T(x) = GCD(A(x), B(x))) and the greatest common divisor of the given polynomials (A(x)) and  
(B(x)).  
Results are calculated by applying the Extended Euclidean  
algorithm.  
ExtendedGCD(x^2-1,x+4) yields {(1,-x+4,15)}. (Plugging the result into the Bézout’s identity for polynomials  
we have: (1 \cdot (x^2-1) + (-x+4) \cdot (x+4) = 15)).  
The GCD of two polynomials is not unique (it’s unique up to a scalar multiple).  
See also GCD Command.

### FDistribution

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/FDistribution/>

**语法：**

```
FDistribution( <Numerator Degrees of Freedom>, <Denominator Degrees of Freedom>, <Variable Value> )
FDistribution( <Numerator Degrees of Freedom>, <Denominator Degrees of Freedom>, <Variable Value>, <Boolean Cumulative> )
FDistribution( <Numerator Degrees of Freedom>, <Denominator Degrees of Freedom>, x, <Boolean Cumulative> )
```

**说明 / 示例：**

Calculates the value of the cumulative distribution function of an F-distribution at variable value v, i.e. the probability  
P(X≤v) where X is a random variable with F-distribution with given numerator and denominator degrees of freedom.  
This syntax returns the probability at a given value, that is the area under the F-distribution curve to the left of the given x-coordinate.  
If Cumulative = true, calculates the value of the cumulative distribution function of an F-distribution with given numerator and denominator degrees of freedom at the given variable value, otherwise it calculates the probability density function of the F-distribution at variable value.  
If Cumulative = true, creates the cumulative density function (cdf) of an F-distribution with given numerator and denominator degrees of freedom, otherwise it creates the probability density function (pdf) of the distribution.  
This command is also available in the  
CAS View.

### Factor

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Factor/>

**语法：**

```
Factor( <Polynomial> )
Factor( <Number> )
Factor( <Expression>, <Variable> )
```

**说明 / 示例：**

This command differs among variants of English:  
Factor (US)  
Factorise (UK + Aus)  
Factors the polynomial.  
Factor(x^2 + x - 6) yields (x - 2) (x + 3).  
This command needs to load the Computer Algebra System, so can be slow on some computers.  
CAS Syntax  
In the CAS View you can also  
use the following syntax:  
Expresses a number in its prime factorization  
Factor(360) yields 2³ 3² 5.  
Factors an expression with respect to a given variable.  
Factor(x^2 - y^2, x) yields (x - y) (x + y), the factorization of x2 - y2 with respect to x,  
Factor(x^2 - y^2, y) yields -(y - x) (y + x), the factorization of x2 - y2 with respect to y.  
This command factors expressions over the Rational Numbers. To factor over  
irrational real numbers, see the IFactor Command. To factor over complex numbers, see the  
CFactor Command and CIFactor Command.

### Factors

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Factors/>

**语法：**

```
Factors( <Polynomial> )
Factors( <Number> )
```

**说明 / 示例：**

Gives a list of lists of the type {factor, exponent} such that the product of all these factors raised to the power  
of the corresponding exponents equals the given polynomial. The factors are sorted by degree in ascending order.  
Factors(x^8 - 1) yields {{x - 1, 1}, {x + 1, 1}, {x^2 + 1, 1}, {x^4 + 1, 1}}.  
Not all of the factors are irreducible over the reals.  
Gives matrix of the type (\left( \begin{array}{ll} prime_1 & exponent_1 \ prime_2 & exponent_2 \prime_3 &  
exponent_3 \ \end{array} \right) ) such that the product of all these primes raised to the power of the  
corresponding exponents equals the given number. The primes are sorted in ascending order.  
Factors(1024) yields ( 2 10 ), since (1024 = 2^{10}).  
Factors(42) yields (\left( \begin{array}{ll} 2 & 1 \ 3 & 1 \7 & 1 \ \end{array} \right) ), since  
(42 = 2^1・3^1・7^1).  
See also PrimeFactors Command and Factor Command.  
In the CAS View undefined  
variables can be used as input and the results are returned as proper matrices.  
Factors(a^8 - 1) yields (\left( \begin{array}{cc} a - 1 & 1 \ a +1 & 1 \a^2 + 1& 1 \a^4 + 1& 1 \  
\end{array} \right)).

### First

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/First/>

**语法：**

```
First( <List> )
First( <List>, <Number n of elements> )
First( <Text> )
First( <Text> , <Number n of elements> )
First( <Locus>, <Number n of elements> )
```

**说明 / 示例：**

Gives a new list that contains the first element of the given list.  
First({1, 4, 3}) yields {1}.  
To get the first element use Element({1, 4, 3}, 1).  
Gives a new list that contains just the first n elements of the given list.  
First({1, 4, 3}, 2) yields {1, 4}.  
Gives first character of the text.  
First("Hello") yields "H".  
Gives the first n characters of the text.  
First("Hello",2) yields "He".  
This command is useful for  
loci generated by NSolveODE Command - It returns list points that were created in the  
first n steps of the numeric ODE-solving algorithm.  
loci generated using ShortestDistance Command,  
TravelingSalesman Command, Voronoi Command,  
MinimumSpanningTree Command and ConvexHull  
Command Commands - It returns vertices of the graph.  
See also Last Command.

### FitExp

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/FitExp/>

**语法：**

```
FitExp( <List of Points> )
```

**说明 / 示例：**

Calculates the exponential regression curve in the form aℯbx.  
FitExp({(0, 1), (2, 3), (4, 3), (6, 4)}) yields 1.31ℯ0.21x.  
If you want the answer in the form ( a b ^ x ) then use the FitGrowth Command.  
You can do a direct least-squares fitting with Fit(list, a*exp(b*x))  
Euler’s number ℯ can be obtained by pressing ALT + e.  
See also Fit, FitGrowth, FitLine,  
FitLineX, FitLog,  
FitLogistic, FitPoly, FitPow  
and FitSin.

### FitLog

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/FitLog/>

**语法：**

```
FitLog( <List of Points> )
```

**说明 / 示例：**

Calculates the logarithmic regression curve.  
FitLog({(ℯ, 1), (ℯ^2, 4)}) yields -2 + 3 ln(x).  
CAS Syntax  
Calculates the logarithmic regression curve.  
FitLog({(ℯ, 1), (ℯ^2, 4)}) yields 3 ln(x) - 2.  
Euler’s number ℯ can be obtained by pressing ALT + e.  
See also FitExp Command, FitPoly Command,  
FitPow Command and FitSin Command.  
If you work with big/small numbers, you should consider normalizing them for a more accurate result, see  
Normalize Command.

### FitPoly

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/FitPoly/>

**语法：**

```
FitPoly( <List of Points>, <Degree of Polynomial> )
FitPoly( <Freehand Function>, <Degree of Polynomial> )
```

**说明 / 示例：**

Calculates the polynomial regression model of given degree that fits the specified points.  
FitPoly({(-1, -1), (0, 1), (1, 1), (2, 5)}, 3) yields f(x) = x3 - 1 x2 + 1.  
Calculates the polynomial regression model of given degree that fits a function drawn using the  
Freehand Shape Tool.  
To obtain a polynomial of degree n the list must contain at least n + 1 points.  
See also FitExp Command, FitLog Command,  
FitPow Command and FitSin Command.  
When working with big/small numbers, consider normalizing them for a more accurate result. See  
Normalize Command.  
CAS Syntax  
Calculates the polynomial regression model of given degree that fits the specified points.  
FitPoly({(-1, -1), (0, 1), (1, 1), (2, 5)}, 3) yields x3 - x2 + 1.

### FitPow

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/FitPow/>

**语法：**

```
FitPow( <List of Points> )
```

**说明 / 示例：**

Calculates the regression curve in the form a xb.  
FitPow({(1, 1), (3, 2), (7, 4)}) creates the regression curve f(x) = 0.97 x0.71.  
CAS Syntax  
Calculates the regression curve in the form a xb.  
FitPow({(1, 1), (3, 2), (7, 4)}) yields 0.97 x0.71.  
All points used need to be in the first quadrant of the coordinate system.  
See also FitExp Command, FitLog Command,  
FitPoly Command, and FitSin Command.  
If you work with big/small numbers, you should consider normalizing them for a more accurate result, see  
Normalize Command.

### FitSin

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/FitSin/>

**语法：**

```
FitSin( <List of Points> )
```

**说明 / 示例：**

Calculates the regression curve in the form a + b sin (c x + d).  
FitSin({(1, 1), (2, 2), (3, 1), (4, 0), (5, 1), (6, 2)}) yields f(x) = 1 + 1 sin (1.57 x - 1.57).  
The list should have at least four points, preferably more. The list should cover at least two extremal points. The  
first two local extremal points should not be too different from the absolute extremal points of the curve.  
See also FitExp Command, FitLog Command,  
FitPoly Command and FitPow Command.  
If you work with big/small numbers, you should consider normalizing them for a more accurate result, see  
Normalize Command.

### GCD

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/GCD/>

**语法：**

```
GCD( <Number>, <Number> )
GCD( <List of Numbers> )
GCD( <Polynomial>, <Polynomial> )
GCD( <List of Polynomials> )
```

**说明 / 示例：**

This command differs among variants of English:  
GCD (US)  
HCF (UK + Aus)  
Calculates the greatest common divisor of the two numbers .  
GCD(12, 15) yields 3.  
Calculates the greatest common divisor of the list of numbers.  
GCD({12, 30, 18}) yields 6.  
CAS Syntax  
In the CAS View you can also use the following syntax:  
Calculates the greatest common divisor of the two polynomials.  
GCD(x^2 + 4 x + 4, x^2 - x - 6) yields x + 2.  
Calculates the greatest common divisor of the list of polynomials.  
GCD({x^2 + 4 x + 4, x^2 - x - 6, x^3 - 4 x^2 - 3 x + 18}) yields x + 2.  
See also LCM Command and ExtendedGCD Command.

### Gamma

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Gamma/>

**语法：**

```
Gamma( <Alpha>, <Beta>, <Variable Value> )
Gamma( <Alpha>, <Beta>, <Variable Value>, <Boolean Cumulative> )
Gamma( <Alpha>, <Beta>, x, <Boolean Cumulative> )
```

**说明 / 示例：**

Calculates the value of the cumulative distribution function of a Gamma distribution at variable value v, i.e. the  
probability P(X ≤ v) where X is a random variable with a Gamma distribution defined by the parameters alpha and beta.  
This syntax returns the probability at a given value, that is the area under the Gamma distribution curve to the left of the given x-coordinate.  
If Cumulative = true, calculates the value of the cumulative distribution function of a Gamma distribution with given alpha and beta at the given variable value, otherwise it calculates the probability density function of the distribution at variable value.  
If Cumulative = true, creates the cumulative density function (cdf) of a Gamma distribution with given alpha and beta, otherwise it creates the probability density function (pdf) of the distribution.

### GroebnerDegRevLex

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/GroebnerDegRevLex/>

**语法：**

```
GroebnerDegRevLex( <List of Polynomials> )
GroebnerDegRevLex( <List of Polynomials>, <List of Variables> )
```

**说明 / 示例：**

CAS Syntax  
Computes the Gröbner basis of the list of the polynomials with respect to graded reverse lexicographical ordering of  
the variables (also known as total degree reverse lexicographic ordering, degrevlex or grevlex ordering).  
GroebnerDegRevLex({x^3 - y - 2, x^2 + y + 1}) yields {( y^{2} - x + 3 y + 3, x y + x + y + 2, x^{2} + y +  
1 )}.  
Computes the Gröbner basis of the list of the polynomials with respect to graded reverse lexicographical ordering of  
the given variables (also known as total degree reverse lexicographic ordering, degrevlex or grevlex ordering).  
GroebnerDegRevLex({x^3 - y - 2, x^2 + y + 1}, {y, x}) yields {( x^{2} + y + 1, y x + y + x + 2, y^{2} + 3y - x + 3)}.  
See also GroebnerLex and GroebnerLexDeg commands.

### GroebnerLex

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/GroebnerLex/>

**语法：**

```
GroebnerLex( <List of Polynomials> )
GroebnerLex( <List of Polynomials>, <List of Variables> )
```

**说明 / 示例：**

CAS Syntax  
Computes the Gröbner basis of the list of the polynomials with respect to lexicographical ordering of the variables  
(also known as lex, plex or pure lexical ordering).  
GroebnerLex({x^3-y-2,x^2+y+1}) yields {( y^{3} + 4 y^{2} + 7 y + 5, x - y^{2} - 3 y - 3 )}.  
Computes the Gröbner basis of the list of the polynomials with respect to lexicographical ordering of the given  
variables (also known as lex, plex or pure lexical ordering).  
GroebnerLex({x^3-y-2,x^2+y+1},{y,x}) yields {( -x^{3} - x^{2} + 1, -y - x^{2} - 1 )}.  
See also GroebnerDegRevLex and GroebnerLexDeg  
commands.

### GroebnerLexDeg

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/GroebnerLexDeg/>

**语法：**

```
GroebnerLexDeg( <List of Polynomials> )
GroebnerLexDeg( <List of Polynomials>, <List of Variables> )
```

**说明 / 示例：**

CAS Syntax  
Computes the Gröbner basis of the list of the polynomials with respect to graded lexicographical ordering of the  
variables (also known as grlex, tdeg, lexdeg, total degree lexicographic ordering or elimination ordering).  
GroebnerLexDeg({x^3 - y - 2, x^2 + y + 1}) yields {( -y^{2} + x - 3 y - 3, -x y - x - y - 2, x^{2} + y + 1)}.  
Computes the Gröbner basis of the list of the polynomials with respect to graded lexicographical ordering of the given  
variables (also known as grlex, tdeg, lexdeg, total degree lexicographic ordering or elimination ordering).  
GroebnerLexDeg({x^3 - y -2, x^2 + y + 1},{y, x}) yields {( x^{2} + y + 1, -y x - y - x - 2, y^{2} + 3 y - x + 3 )}.  
See also GroebnerDegRevLex and GroebnerLex  
commands.

### HyperGeometric

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/HyperGeometric/>

**语法：**

```
HyperGeometric( <Population Size>, <Number of Successes>, <Sample Size>)
HyperGeometric( <Population Size>, <Number of Successes>, <Sample Size>, <Boolean Cumulative> )
HyperGeometric( <Population Size>, <Number of Successes>, <Sample Size>, <Variable Value>, <Boolean Cumulative> )
```

**说明 / 示例：**

Returns a Hypergeometric distribution bar graph.  
Parameters:  
Population size: number of balls in an urn  
Number of Successes: number of white balls in the urn  
Sample Size: number of balls drawn from the urn  
A random sample is repeatedly extracted from an urn, without replacement. HyperGeometric(100, 50, 5) generates a bar graph showing the probability distribution of the number of white balls in the sample.  
When Cumulative = false returns a bar graph of a Hypergeometric distribution, otherwise it returns the graph of a cumulative Hypergeometric distribution function.  
First three parameters are same as above.  
Let X be a Hypergeometric random variable and v the variable value. The first three parameters are same as above.  
When Cumulative = false it returns P( X = v)  
When Cumulative = true it returns P( X ≤ v)  
Assume you select two balls out of ten balls, two of which are white, without putting any back.  
HyperGeometric(10, 2, 2, 0, false) yields (\frac{28}{45}), the probability of selecting zero white balls,  
HyperGeometric(10, 2, 2, 1, false) yields (\frac{16}{45}), the probability of selecting one white ball,  
HyperGeometric(10, 2, 2, 2, false) yields (\frac{1}{45}), the probability of selecting both white balls,  
HyperGeometric(10, 2, 2, 3, false) yields 0, the probability of selecting three white balls.  
HyperGeometric(10, 2, 2, 0, true) yields (\frac{28}{45}), the probability of selecting zero (or less)  
white balls,  
HyperGeometric(10, 2, 2, 1, true) yields (\frac{44}{45}), the probability of selecting one or less white  
balls,  
HyperGeometric(10, 2, 2, 2, true) yields 1, the probability of selecting two or less white balls and  
HyperGeometric(10, 2, 2, 3, true) yields 1, the probability of selecting three or less white balls.  
CAS Syntax  
In the CAS View you can use  
only the following syntax:  
Let X be a Hypergeometric random variable and v the variable value. The first three parameters are the same as above.  
When Cumulative = false it returns P( X = v)  
When Cumulative = true it returns P( X ≤ v)

### IFactor

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/IFactor/>

**语法：**

```
IFactor( <Polynomial> )
IFactor( <Expression> )
IFactor( <Expression>, <Variable> )
```

**说明 / 示例：**

Factors over the irrationals.  
IFactor(x^2 + x - 1) gives ( \left( x + \frac{-\sqrt{5} + 1}{2} \right) \left( x + \frac{\sqrt{5} +  
1}{2} \right))  
CAS Syntax  
Factors over the irrationals.  
IFactor(x^2 + x - 1) returns ( \left( x + \frac{-\sqrt{5} + 1}{2} \right) \left( x + \frac{\sqrt{5} +  
1}{2} \right))  
Factors over the irrationals with respect to a given variable.  
IFactor(a^2 + a - 1, a) returns ( \left( a + \frac{-\sqrt{5} + 1}{2} \right) \left( a + \frac{\sqrt{5} +  
1}{2} \right))  
See also CIFactor command.

### Identity

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Identity/>

**语法：**

```
Identity( <Number> )
```

**说明 / 示例：**

Gives the identity matrix of the given order.  
Identity(3) yields the matrix (\begin{pmatrix}1&0&0\0&1&0\0&0&1\end{pmatrix}).  
If A is a square matrix of order n, A^0 yields the same as Identity(n).

### ImplicitDerivative

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/ImplicitDerivative/>

**语法：**

```
ImplicitDerivative( <f(x, y)> )
ImplicitDerivative( <Expression>, <Dependent Variable>, <Independent Variable> )
```

**说明 / 示例：**

Gives the implicit derivative of the given expression.  
ImplicitDerivative(x + 2 y) yields -0.5.  
CAS Syntax  
Gives the implicit derivative of the given expression.  
ImplicitDerivative(x + 2 y) yields -(\frac{1}{2}).  
Gives the implicit derivative of the given expression.  
ImplicitDerivative(x^2 + y^2, y, x) yields -(\frac{x}{y}).  
See also Derivative Command.

### Integral

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Integral/>

**语法：**

```
Integral( <Function> )
Integral( <Function>, <Variable> )
Integral( <Function>, <Start x-Value>, <End x-Value> )
Integral( <Function>, <Start x-Value>, <End x-Value>, <Boolean Evaluate> )
Integral( <Function>, <Variable>, <Start Value>, <End Value> )
```

**说明 / 示例：**

Gives the indefinite integral with respect to the main variable.  
Integral(x³) gives (\frac{1}{4}x^4) .  
Gives the partial integral with respect to the given variable.  
Integral(x³+3x y, x) gives (\frac{1}{4}x^4+\frac{3}{2}x^2 y) .  
Gives the definite integral over the interval [Start x-Value , End x-Value] with respect to the main variable.  
Integral(x³, 1, 2) yields 3.75.  
This command also shades the area between the function graph of f and the x-axis.  
Gives the definite integral of the function over the interval [Start x-Value , End x-Value] with respect to the main  
variable and shades the related area if Evaluate is true. In case Evaluate is false the related area is shaded  
but the integral value is not calculated.  
CAS Syntax  
In the CAS View undefined  
variables are allowed as input as well.  
Integral(cos(a t), t) yields (\frac{sin(a t)}{a} + c_1).  
Gives the definite integral over the interval [Start Value , End Value] of the given variable.  
Integral(cos(t), t, a, b) yields (- sin(a) + sin(b)).  
The answer isn’t guaranteed to be continuous, eg Integral(floor(x)), that is the integral of the function ⌊x⌋ -  
in that case you can define your own function to use eg F(x)=(floor(x)² - floor(x))/2 + x floor(x) - floor(x)²,  
i.e. the function (\frac{⌊x⌋² - ⌊x⌋}{2} + x \cdot⌊x⌋ - ⌊x⌋²)  
in some versions of GeoGebra, a numerical algorithm is used so integrating up to an asypmtote or similar eg  
Integral(ln(x), 0, 1) won’t work. In this case try Integral(ln(x), 0, 1, false)

### IntegralBetween

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/IntegralBetween/>

**语法：**

```
IntegralBetween( <Function>, <Function>, <Number>, <Number> )
IntegralBetween( <Function>, <Function>, <Number>, <Number>, <Boolean Evaluate> )
IntegralBetween( <Function>, <Function>, <Variable>, <Number>, <Number> )
```

**说明 / 示例：**

Gives the definite integral of the difference f(x) ‐ g(x) of two function f and g over the interval [a, b],  
where a is the first number and b the second, with respect to the main variable.  
IntegralBetween(sin(x), cos(x), 0, pi) yields 2.  
This command also shades the area between the function graphs of f and g.  
Gives the definite integral of the difference f(x) ‐ g(x) of two function f and g over the interval [a, b],  
where a is the first number and b the second, with respect to the main variable and shadows the related area if  
Evaluate is true. In case Evaluate is false the related area is shaded but the integral value is not calculated.  
CAS Syntax  
Gives the definite integral of the difference f(x) ‐ g(x) of two function f and g over the interval [a, b],  
where a is the first number and b the second, with respect to the main variable.  
IntegralBetween(sin(x), cos(x), pi / 4, pi * 5 / 4) yields (2 \sqrt{2}).  
Gives the definite integral of a variable of the difference f(x) ‐ g(x) of two function f and g over the  
interval [a, b], where a is the first number and b the second, with respect to the given variable.  
IntegralBetween(a \* sin(t), a \* cos(t), t, pi / 4, pi \* 5 / 4) yields (2 \sqrt{2} a).

### IntegralSymbolic

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/IntegralSymbolic/>

**语法：**

```
IntegralSymbolic(<Function>)
IntegralSymbolic(<Function>, <Variable>)
```

**说明 / 示例：**

CAS Syntax  
Gives the indefinite symbolic integral with respect to the main variable. The constant of integration c is not shown  
automatically as a slider.  
IntegralSymbolic(3x^2) yields (x^3+c\_{1}).  
Gives the partial symbolic integral with respect to the given variable. The constant of integration c is not shown  
automatically as a slider.  
IntegralSymbolic(x³+3x y, x) gives ( \frac{1}{4}x^4) + (\frac{3}{2} x² y+c\_{1} ) .

### Intersect

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Intersect/>

**语法：**

```
Intersect( <Object>, <Object> )
Intersect( <Object>, <Object>, <Index of Intersection Point> )
Intersect( <Object>, <Object>, <Initial Point> )
Intersect( <Function>, <Function>, <Start x-Value>, <End x-Value> )
Intersect( <Curve 1>, <Curve 2>, <Parameter 1>, <Parameter 2> )
Intersect( <Function>, <Function> )
Intersect( <Line> , <Object> ) creates the intersection point(s) of a line and a plane, segment, polygon, conic,
Intersect( <Plane> , <Object> ) creates the intersection point(s) of a plane and segment, polygon, conic, etc.
Intersect( <Conic>, <Conic> ) creates the intersection point(s) of two conics
Intersect( <Plane>, <Plane> ) creates the intersection line of two planes
Intersect( <Plane>, <Polyhedron> ) creates the polygon(s) intersection of a plane and a polyhedron.
Intersect( <Sphere>, <Sphere> ) creates the circle intersection of two spheres
Intersect( <Plane>, <Quadric> ) creates the conic intersection of the plane and the quadric (sphere, cone,
```

**说明 / 示例：**

Yields the intersection points of two objects.  
Let a: -3x + 7y = -10 be a line and c: x^2 + 2y^2 = 8 be an ellipse. Intersect(a, c) yields the  
intersection points E = (-1.02, -1.87) and F = (2.81, -0.22) of the line and the ellipse.  
Intersect(y = x + 3, Curve(t, 2t, t, 0, 10)) yields A=(3, 6).  
Intersect(Curve(2s, 5s, s,-10, 10), Curve(t, 2t, t, -10, 10)) yields A=(0, 0).  
Yields the nth intersection point of two objects. Each object must be a line, conic, polynomial function or implicit  
curve.  
Let a(x) = x^3 + x^2 - x be a function and b: -3x + 5y = 4 be a line. Intersect(a, b, 2) yields the  
intersection point C = (-0.43, 0.54) of the function and the line.  
Yields an intersection point of two objects by using a numerical, iterative method with initial point.  
Let a(x) = x^3 + x^2 - x be a function, b: -3x + 5y = 4 be a line, and C = (0, 0.8) be the initial point.  
Intersect(a, b, C) yields the intersection point D = (-0.43, 0.54) of the function and the line by using a  
numerical, iterative method.  
Yields the intersection points numerically for the two functions in the given interval.  
Let f(x) = x^3 + x^2 - x and g(x) = 4 / 5 + 3 / 5 x be two functions. Intersect(f, g, -1, 2) yields  
the intersection points A = (-0.43, 0.54) and B = (1.1, 1.46) of the two functions in the interval [ -1, 2 ].  
Finds one intersection point using a numerical, iterative method starting at the given parameters.  
Let a = Curve(cos(t), sin(t), t, 0, π) and b = Curve(cos(t) + 1, sin(t), t, 0, π).  
Intersect(a, b, 0, 2) yields the intersection point A = (0.5, 0.87).  
CAS Syntax  
Yields a list containing the intersection points of two objects.  
Let f(x):= x^3 + x^2 - x and g(x):= x be two functions. Intersect(f(x), g(x)) yields the intersection  
points list: {(1, 1), (0, 0), (-2, -2)} of the two functions.  
etc.  
cylinder, …)  
to get all the intersection points in a list you can use eg {Intersect(a,b)}  
See also IntersectConic and IntersectPath  
commands.  
See also  
Intersect tool.

### InverseLaplace

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/InverseLaplace/>

**语法：**

```
InverseLaplace( <Function> )
InverseLaplace( <Function>, <Variable> )
InverseLaplace( <Function>, <Original Variable>, <Transformed Variable> )
```

**说明 / 示例：**

CAS Syntax  
Returns the inverse Laplace transform of the given function.  
InverseLaplace(1/(1+t^2)) returns (\mathbf{ sin(t)} ).  
Returns the inverse Laplace transform of the function, with respect to the given variable.  
InverseLaplace( exp(- a*b),a) returns (\mathbf{Dirac(a-b)})  
InverseLaplace( exp(- a*b),b) returns (\mathbf{Dirac(b-a)})  
Returns the inverse Laplace transform of the given function with respect to the original variable, expressed in terms of the transformed variable.  
InverseLaplace(1/(s^2+1),s,x) returns (\mathbf{ sin(x)})  
See also Laplace command.

### Invert

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Invert/>

**语法：**

```
Invert( <Matrix> )
Invert( <Function> )
```

**说明 / 示例：**

Inverts the given matrix.  
Invert({{1, 2}, {3, 4}}) yields (\begin{pmatrix}-2 & 1\1.5 & -0.5\end{pmatrix}), the inverse matrix of  
(\begin{pmatrix}1 & 2\3 & 4\end{pmatrix}).  
In the CAS View undefined  
variables are allowed too.  
Invert({{a, b}, {c, d}}) yields (\begin{pmatrix}\frac{d}{ad- bc} & \frac{-b}{ad- bc}\\\frac{-c}{ad-  
bc}& \frac{a}{ad- bc}\end{pmatrix}), the inverse matrix of (\begin{pmatrix}a & b\c & d\end{pmatrix}).  
Gives the inverse of the function.  
Invert(sin(x)) yields asin(x).  
No account is taken of domain or range, for example for f(x) = x2 or f(x) = sin(x).  
The command works faster for functions that only contain one x.  
To make your construction more efficient you may want to rearrange your functions and use eg NInvert((x+1)^2-1) rather than NInvert(x^2+2x).  
See also NInvert Command, Eigenvalues Command, Eigenvectors Command,  
SVD Command, Transpose Command, JordanDiagonalization Command

### IsPrime

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/IsPrime/>

**语法：**

```
IsPrime( <Number> )
```

**说明 / 示例：**

Gives true or false depending on whether the number is prime or not.  
IsPrime(10) yields false,  
IsPrime(11) yields true.  
CAS Syntax  
Gives true or false depending on whether the number is prime or not.  
IsPrime(10) yields false,  
IsPrime(11) yields true.

### JordanDiagonalization

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/JordanDiagonalization/>

**语法：**

```
JordanDiagonalization( <Matrix> )
```

**说明 / 示例：**

This command differs among variants of English:  
JordanDiagonalization (US)  
JordanDiagonalisation (UK + Aus)  
CAS Syntax  
Decomposes the given matrix into the form S J S⁻¹ where J is in  
Jordan Canonical Form  
JordanDiagonalization({{1, 2}, {3, 4}}) yields ( \left(\begin{array}{}\sqrt{33} - 3&-\sqrt{33} -  
3\6&6\\\end{array}\right) ), ( \left(\begin{array}{}\frac{\sqrt{33} + 5}{2}&0\0&\frac{-\sqrt{33} +  
5}{2}\\\end{array}\right) )  
See also Eigenvalues Command, Eigenvectors Command,  
SVD Command, Invert Command,  
Transpose Command

### Laplace

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Laplace/>

**语法：**

```
Laplace( <Function> )
Laplace( <Function>, <Variable> )
Laplace( <Function>, <Original Variable>, <Transformed Variable> )
```

**说明 / 示例：**

CAS Syntax  
Returns the Laplace transform of the given function.  
Laplace(sin(t)) returns (\mathbf{\frac{1}{s^{2} + 1}} )  
Returns the Laplace transform of the function, with respect to the given variable.  
Laplace(sin(a*t),t) returns (\mathbf{\frac{a}{a^{2} + t^{2}}})  
Laplace(sin(a*t),a) returns (\mathbf{\frac{t}{a^{2} + t^{2}}})  
Returns the Laplace transform of the given function with respect to the original variable, expressed in terms of the transformed variable.  
Laplace(sin(a*t),t,s) returns (\mathbf{\frac{a}{a^{2} + s^{2}}})  
Laplace(sin(a*t),a,b) returns (\mathbf{\frac{t}{b^{2} + t^{2}}})  
See also InverseLaplace command.

### Last

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Last/>

**语法：**

```
Last( <List> )
Last( <List>, <Number of elements> )
Last( <Text> )
Last( <Text> , <Number of elements> )
```

**说明 / 示例：**

Gives a new list that contains the last element of the initial list.  
Last({1, 4, 3}) yields {3}.  
To get the last element use Element({1, 4, 3}, 3).  
Gives a new list that contains just the last n elements of the initial list.  
Last({1, 4, 3}, 2) yields {4, 3}.  
Gives last character of the text.  
Last("Hello") yields "o".  
Gives the last n characters of the text.  
Last("Hello", 2) yields "lo".  
See also First Command.

### LCM

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/LCM/>

**语法：**

```
LCM( <Number>, <Number> )
LCM( <List of Numbers> )
LCM( <Polynomial>, <Polynomial> )
LCM( <List of Polynomials> )
```

**说明 / 示例：**

UK English: LCM = lowest common multiple  
Calculates the least common multiple of two numbers.  
LCM(12, 15) yields 60.  
Calculates the least common multiple of the elements in the list.  
LCM({12, 30, 18}) yields 180.  
CAS Syntax  
In the CAS View you can also use the following syntax:  
Calculates the least common multiple of the two polynomials.  
LCM(x^2 + 4 x + 4, x^2 - x - 6) yields (x^3 + x^2 - 8 x - 12).  
Calculates the least common multiple of the polynomials in the list.  
LCM({x^2 + 4 x + 4, x^2 - x - 6, x^3 - 4 x^2 - 3 x + 18}) yields (x^4 - 2 x^3 - 11 x^2 + 12 x + 36).  
See also GCD Command.

### LeftSide

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/LeftSide/>

**语法：**

```
LeftSide( <Equation> )
LeftSide( <List of Equations> )
LeftSide( <List of Equations>, <Index> )
```

**说明 / 示例：**

Gives the left-hand side of the simplified equation.  
LeftSide(4x = 1 - 3y) yields 4x.  
CAS Syntax  
Gives the left-hand side of the equation.  
LeftSide(x + 2 = 3 x + 1) yields x + 2.  
Gives the list of the left-hand sides of the equations.  
LeftSide({a^2 + b^2 = c^2, x + 2 = 3 x + 1}) yields ( \left{a^2 + b^2, x + 2 \right} ) .  
Gives the left-hand side of the equation specified by the index.  
LeftSide({a^2 + b^2 = c^2, x + 2 = 3 x + 1}, 1) yields (a^2 + b^2).  
See also RightSide Command.

### Length

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Length/>

**语法：**

```
Length( <Object> )
Length( <Vector> ) yields the length of the vector.
Length( <Point> ) yields the length of the position vector of the given point.
Length( <List> ) yields the length of the list, which is the number of elements in the list.
Length( <Text> ) yields the number of characters in the text.
Length( <Locus> ) returns the number of points that the given locus is made up of. Use
Length( <Arc> ) returns the arc length (i.e. just the length of the curved section) of an arc or sector.
Length( <Function>, <Start x-Value>, <End x-Value> )
Length( <Function>, <Start Point>, <End Point> )
Length( <Curve>, <Start t-Value>, <End t-Value> )
Length( <Curve>, <Start Point>, <End Point> )
Length( <Function>, <Variable>, <Start x-Value>, <End x-Value> )
```

**说明 / 示例：**

Yields the length of the object.  
Perimeter(Locus) to get the length of the locus itself. For details see the article about  
First Command.  
Yields the length of the function graph in the given interval.  
Length(2x, 0, 1) returns 2.236067977, about (\sqrt{5}).  
Yields the length of the function graph between the two points.  
If the given points do not lie on the function graph, their x‐coordinates are used to determine the interval.  
Yields the length of the curve between the two values of the parameter.  
Yields the length of the curve between the two points that lie on the curve.  
CAS Syntax  
Calculates the length of a function graph between the two points.  
Length(2 x, 0, 1) yields (\sqrt{5}).  
Calculates the length of a function graph from Start x-value to End x-value.  
Length(2 a, a, 0, 1) yields (\sqrt{5}).  
See also  
Distance or Length tool.

### Limit

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Limit/>

**语法：**

```
Limit( <Function>, <Value> )
Limit( <Expression>, <Value> )
Limit( <Expression>, <Variable>, <Value> )
```

**说明 / 示例：**

Computes the limit of the function for the given value of the main  
function variable. (This may also yield infinity.)  
Limit((x^2 + x) / x^2, +∞) yields 1.  
Not all limits can be calculated by GeoGebra, so undefined will be returned in those cases (as well as when the  
correct result is undefined).  
CAS Syntax  
Computes the limit of the expression for the given value of the main function variable.  
Limit(a sin(x) / x, 0) yields a.  
Computes the limit of the expression for the given value of the given function variable.  
Limit(a sin(v) / v, v, 0) yields a.  
Not all limits can be calculated by GeoGebra, so ? will be returned in those cases (as well as when the correct  
result is undefined).  
If you want the limit of a piecewise-defined function you need to use  
LimitAbove or LimitBelow, for example  
LimitAbove(If(x>1, x^2, -2x), 1)  
See also Asymptote Command, LimitAbove Command and  
LimitBelow Command.

### LimitAbove

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/LimitAbove/>

**语法：**

```
LimitAbove( <Function>, <Value> )
LimitAbove( <Expression>, <Value> )
LimitAbove( <Expression>, <Variable>, <Value> )
```

**说明 / 示例：**

Computes the right one-sided limit of the function  
for the given value of the main function variable.  
LimitAbove(1 / x, 0) yields (\infty) .  
Not all limits can be calculated by GeoGebra, so undefined will be returned in those cases (as well as when the  
correct result is undefined).  
CAS Syntax  
Computes the right one-sided limit of the function for the given value of the main function variable.  
LimitAbove(1 / x, 0) yields (\infty) .  
Computes the right one-sided limit of the multivariate function for the given value of the given function variable.  
LimitAbove(1 / a, a, 0) yields (\infty) .  
Not all limits can be calculated by GeoGebra, so ? will be returned in those cases (as well as when the correct result  
is undefined).  
See also Limit Command and LimitBelow Command.

### LimitBelow

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/LimitBelow/>

**语法：**

```
LimitBelow( <Function>, <Value> )
LimitBelow( <Expression>, <Value> )
LimitBelow( <Expression>, <Variable>, <Value> )
```

**说明 / 示例：**

Computes the left one-sided limit of the function  
for the given value of the main function variable.  
LimitBelow(1 / x, 0) yields (-\infty) .  
Not all limits can be calculated by GeoGebra, so undefined will be returned in those cases (as well as when the  
correct result is undefined).  
CAS Syntax  
Computes the left one-sided limit of the function for the given value of the main function variable.  
LimitBelow(1 / x, 0) yields (-\infty) .  
Computes the left one-sided limit of the multivariate function for the given value of the given function variable.  
LimitBelow(1 / a, a, 0) yields (-\infty) .  
Not all limits can be calculated by GeoGebra, so ? will be returned in those cases (as well as when the correct result  
is undefined).  
See also Limit Command and LimitAbove Command.

### LUDecomposition

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/LUDecomposition/>

**语法：**

```
LUDecomposition( <Matrix> )
```

**说明 / 示例：**

CAS Syntax  
Calculates the LU decomposition of the given matrix.  
LUDecomposition({{2,0},{1,1}}) returns the matrices  
(\begin{pmatrix}0&1\1&0\end{pmatrix}),(\begin{pmatrix}1&0\2&1\end{pmatrix}) and  
(\begin{pmatrix}1&1\0&-2\end{pmatrix}).  
See also QRDecomposition command.

### MatrixRank

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/MatrixRank/>

**语法：**

```
MatrixRank( <Matrix> )
```

**说明 / 示例：**

Returns the rank of given matrix.  
MatrixRank({{2, 2}, {1, 1}}) yields 1.  
MatrixRank({{1, 2}, {3, 4}}) yields 2.  
Let A = {{1, 2, 3}, {1, 1, 1}, {2, 2, 2}} be a 3x3-matrix. MatrixRank(A) yields 2.  
Hint: In the CAS View this command also works with undefined variables.  
MatrixRank({{1, 2}, {k*1, k*2}}) yields 1.

### Max

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Max/>

**语法：**

```
Max( <List> )
Max( <Interval> )
Max( <Number>, <Number> )
Max( <Function>, <Start x-Value>, <End x-Value> )
Max(<List of Data>, <List of Frequencies> )
```

**说明 / 示例：**

Returns the maximum of the numbers within the list.  
Max({-2, 12, -23, 17, 15}) yields 17.  
If the input consists of non-numeric objects, then this command considers the numbers associated with those objects. If  
you have a list of segments for example, the command Max( <List> ) will yield the maximum segment length.  
Returns the upper bound of the interval.  
Max(2 < x < 3) yields 3.  
Open and closed intervals are treated the same.  
Returns the maximum of the two given numbers.  
Max(12, 15) yields 15.  
Calculates (numerically) the local maximum point of the function in the given interval. The function should be  
continuous, defined over its natural domain (i.e. no domain restrictions are applied), and have only one local maximum point in the interval (and no local minimum).  
Max(exp(x)x^2,-3,-1) creates the point (-2, 0.54134).  
For polynomials you should use the Extremum Command.  
Returns the maximum of the list of data with corresponding frequencies.  
Max({1, 2, 3, 4, 5}, {5, 3, 4, 2, 0}) yields 4, the highest number of the list whose frequency is greater than 0.  
If you want the maximum of two functions f(x) and g(x) then you can define  
(f(x) + g(x) + abs(f(x) - g(x)))/2  
See also Extremum Command, Min Command and  
Function Inspector Tool.  
CAS Syntax  
Unlike in the Algebra View, this syntax will give the maximum over the interval, including endpoints. The function should be  
continuous, defined over its natural domain (i.e. no domain restrictions are applied), and have only one local maximum point in the interval (and no local minimum).  
Max(x^2,-1,2) yields the point (2,4)  
Max(-x^2,-1,2) yields the point (0,0)

### Mean

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Mean/>

**语法：**

```
Mean( <List of Raw Data> )
Mean( <List of Numbers>, <List of Frequencies> )
```

**说明 / 示例：**

Calculates the arithmetic mean of list elements.  
Mean({1, 2, 3, 2, 4, 1, 3, 2}) yields a = 2.25 and  
Mean({1, 3, 5, 9, 13}) yields a = 6.2.  
Calculates the weighted mean of the list elements.  
Mean({1, 2, 3, 4}, {6, 1, 3, 6}) yields a = 2.56 and  
Mean({1, 2, 3, 4}, {1, 1, 3, 6}) yields a = 3.27.  
See also MeanX, MeanY, and SD commands.

### Median

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Median/>

**语法：**

```
Median( <List of Raw Data> )
Median( <List of Numbers>, <List of Frequencies> )
```

**说明 / 示例：**

Determines the median of the list elements.  
Median({1, 2, 3}) yields 2.  
Median({1, 1, 8, 8}) yields 4.5.  
Calculates the weighted median of the list elements.  
Median({1, 2, 3}, {4, 1, 3}) yields 1.5.  
Median({1, 2, 3, 4}, {6, 1, 3, 6}) yields 3.  
If the length of the given list is even, the arithmetic mean of the two center elements is returned.  
See also Mean command.

### Min

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Min/>

**语法：**

```
Min( <List> )
Min( <Interval> )
Min( <Number>, <Number> )
Min( <Function>, <Start x-Value>, <End x-Value> )
Min( <List of Data>, <List of Frequencies> )
```

**说明 / 示例：**

Returns the minimum of the numbers within the list.  
Min({-2, 12, -23, 17, 15}) yields -23.  
If the input consists of non-numeric objects, then this command considers the numbers associated with those objects. If  
you have a list of segments for example, the command Min( <List> ) will yield the minimum segment length.  
Returns the lower bound of the interval.  
Min(2 < x < 3) yields 2 .  
Open and closed intervals are not distinguished.  
Returns the minimum of the two given numbers.  
Min(12, 15) yields 12.  
Calculates (numerically) the local minimum point for function in the given interval. The function should be  
continuous, defined over its natural domain (i.e. no domain restrictions are applied), and have only one local minimum point in the interval (and no local maximum).  
Min(exp(x) x^3,-4,-2) creates the point (-3, -1.34425) .  
For polynomials you should use the Extremum Command.  
Returns the minimum of the list of data with corresponding frequencies.  
Min({1, 2, 3, 4, 5}, {0, 3, 4, 2, 3}) yields 2, the lowest number of the first list whose frequency is greater  
than 0.  
If you want the minimum of two functions f(x) and g(x) then you can define  
(f(x) + g(x) - abs(f(x) - g(x)))/2  
See also Max Command, Extremum Command and  
Function Inspector Tool.  
CAS Syntax  
Unlike in the Algebra View, this syntax will give the minimum over the interval, including endpoints. The function should be  
continuous, defined over its natural domain (i.e. no domain restrictions are applied), and have only one local minimum point in the interval (and no local maximum).  
Min(x^2,-1,2) yields the point (0,0)  
Min(-x^2,-1,2) yields the point (2,-4)

### MinimalPolynomial

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/MinimalPolynomial/>

**语法：**

```
MinimalPolynomial( <Matrix> )
```

**说明 / 示例：**

CAS Syntax  
Returns the minimal polynomial of the given matrix.  
MinimalPolynomial({{1,0},{0,1}}) yields (x-1).

### MixedNumber

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/MixedNumber/>

**语法：**

```
MixedNumber( <Number> )
```

**说明 / 示例：**

CAS Syntax  
Converts the given number to a mixed number.  
MixedNumber(3.5) yields (3 + \frac{1}{2}).  
MixedNumber(12 / 3) yields 4.  
MixedNumber(12 / 14) yields (\frac{6}{7}).  
See also Rationalize Command.

### Mod

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Mod/>

**语法：**

```
Mod( <Dividend Number>, <Divisor Number> )
Mod( <Dividend Polynomial>, <Divisor Polynomial> )
```

**说明 / 示例：**

Yields the remainder when dividend number is divided by divisor number.  
Mod(9, 4) yields 1.  
Yields the remainder when the dividend polynomial is divided by the divisor polynomial.  
Mod(x^3 + x^2 + x + 6, x^2 - 3) yields 4 x + 9.  
If you want a function to do this, you can define it yourself, e.g. mod(x, y) = y (x / y - floor(x / y)).

### ModularExponent

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/ModularExponent/>

**语法：**

```
ModularExponent( <Number>, <Number>, <Number> )
```

**说明 / 示例：**

CAS Syntax  
Returns the modular exponent of the given numbers.  
See also Modular exponentiation for further details.  
ModularExponent(5,12,13) yields (1), since (mod(5^{12},13)=1).

### NIntegral

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/NIntegral/>

**语法：**

```
NIntegral( <Function> )
NIntegral( <Function>, <Start x-Value>, <End x-Value> )
NIntegral( <Function>, <Start x-Value>, <Start y-Value>, <End x-Value> )
NIntegral( <Function>, <Variable>, <Start Value>, <End Value> )
```

**说明 / 示例：**

Plots the graph of the indefinite integral (y=F(x)+c) of the given function, with constant of integration c = 0. The equation of the primitive is not shown in Algebra View, because it is computed numerically.  
Computes (numerically) and plots the definite integral (\int_a^bf(x)\mathrm{d}x) of the given function f, from a  
(Start x-Value) to b (End x-Value).  
NIntegral(ℯ^(-x^2), 0, 1) yields 0.75.  
Computes (numerically) the indefinite integral of the given function, and plots the graph of that function through  
(Start x-Value, Start y-Value), with end point at (End x-Value).  
NIntegral(sin(x)/x, π, 1, 2π) plots the graph of the indefinite integral (y=F(x)+c) of the given function in  
the interval [π, 2π]. The value of (c) is defined by the initial condition (start x-Value, start y-Value)=(π, 1).  
Hint: In the CAS View the following syntax can also be used:  
Computes (numerically) the definite integral (\int_a^bf(t)\mathrm{d}x) of the given function f, from a  
(Start value) to b (End value), with respect to the given variable.  
NIntegral(ℯ^(-a^2), a, 0, 1) yields 0.75.

### NSolutions

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/NSolutions/>

**语法：**

```
NSolutions( <Equation> )
NSolutions( <Equation>, <Variable> )
NSolutions( <Equation>, <Variable = starting value> )
NSolutions( <List of Equations>, <List of Variables> )
```

**说明 / 示例：**

Attempts (numerically) to find a solution for the equation for the main variable. For non-polynomials you should  
always specify a starting value (see below)  
NSolutions(x^6 - 2x + 1 = 0) yields {0.51, 1} or {0.508660391642, 1} (the number of decimals depends on the  
chosen in global rounding)  
CAS Syntax  
The following syntaxes are only available in the  
CAS View.  
Attempts (numerically) to find a solution of the equation for the given unknown variable. For non-polynomials you  
should always specify a starting value (see below)  
NSolutions(a^4 + 34a^3 = 34, a) yields {a = -34.00086498588374, a = 0.9904738885574178}.  
Finds numerically the list of solutions to the given equation for the given unknown variable with its starting value.  
NSolutions(cos(x) = x, x = 0) yields {0.74}  
NSolutions(a^4 + 34a^3 = 34, a = 3) yields the list {0.99}.  
Attempts (numerically) to find a solution of the set of equations for the given set of unknown variables.  
NSolutions({pi / x = cos(x - 2y), 2 y - pi = sin(x)}, {x = 3, y = 1.5}) yields the list {3.14, 1.57}  
If you don’t give a starting point like a=3 or {x = 3, y = 1.5} the numerical algorithm may find it hard to find  
a solution (and giving a starting point doesn’t guarantee that a solution will be found)  
The number of decimals depends on the chosen in global rounding.  
NSolutions won’t work for functions that are asymptotic to the x-axis. They can often be reformulated though.  
NSolutions will work only if the function is continuous  
See also Solutions Command and NSolve Command.

### NSolve

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/NSolve/>

**语法：**

```
NSolve( <Equation> )
NSolve( <Equation>, <Variable> )
NSolve( <Equation>, <Variable = starting value> )
NSolve( <List of Equations>, <List of Variables> )
```

**说明 / 示例：**

Attempts (numerically) to find a solution for the equation for the main variable. For non-polynomials you should  
always specify a starting value (see below).  
NSolve(x^6 - 2x + 1 = 0) yields {x = 0.51, x = 1}.  
CAS Syntax  
These syntaxes are only available in the  
CAS View.  
Attempts (numerically) to find a solution of the equation for the given unknown variable. For non-polynomials you  
should always specify a starting value (see below).  
NSolve(a^4 + 34a^3 = 34, a) yields {a = -34, a = 0.99}.  
Finds numerically the list of solutions to the given equation for the given unknown variable with its starting value.  
NSolve(cos(x) = x, x = 0) yields {x = 0.74}  
NSolve(a^4 + 34a^3 = 34, a = 3) yields {a = 0.99}.  
Attempts (numerically) to find a solution of the set of equations for the given set of unknown variables.  
NSolve({pi / x = cos(x - 2y), 2 y - pi = sin(x)}, {x = 3, y = 1.5}) yields {x = 3.14, y = 1.57}.  
If you don’t give a starting point like a=3 or {x = 3, y = 1.5} the numerical algorithm may find it hard to find  
a solution (and giving a starting point doesn’t guarantee that a solution will be found)  
The number of decimals depends on the chosen in global rounding.  
NSolve won’t work for functions that are asymptotic to the x-axis or other extreme examples. They can often be  
reformulated though.  
NSolve will work only if the function is continuous!  
See also Solve Command and NSolutions Command.

### NextPrime

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/NextPrime/>

**语法：**

```
NextPrime( <Number> )
```

**说明 / 示例：**

Returns the smallest prime greater than the entered number.  
NextPrime(10000) yields 10007.  
See also PreviousPrime Command.

### Normal

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Normal/>

**语法：**

```
Normal( <Mean>, <Standard Deviation>, <Variable Value> )
Normal( <Mean>, <Standard Deviation>, <Variable Value>, <Boolean Cumulative> )
Normal( <Mean>, <Standard Deviation>, <Variable Value u> , <Variable Value v>)
Normal( <Mean>, <Standard Deviation>, x, <Boolean Cumulative> )
```

**说明 / 示例：**

Evaluates the function (\Phi \left(\frac{x- \mu}{\sigma} \right) ) at variable value v, where Φ is the cumulative  
distribution function of the standard normal distribution N(0,1).  
Normal(2, 0.5, 1) yields 0.02 in the  
Algebra View and (\frac{erf(-\sqrt{2})+1}{2}) in the  
CAS View.  
This syntax returns the probability at a given value, that is the area under the normal distribution curve to the left of the given x-coordinate.  
If Cumulative = true, evaluates the cumulative distribution function of a normal distribution with given mean and standard deviation at the given variable value, otherwise it evaluates the probability density function of the distribution at variable value.  
Computes the probability of a normal random variable in the interval [u, v], given the mean and the standard deviation. In other words, the syntax Normal(m, s, u, v) is equivalent to Normal(m, s, v, true) - Normal(m, s, u, true)  
If Cumulative = true, creates the cumulative density function (cdf) of a normal distribution with given mean and standard deviation, otherwise it creates the probability density function (pdf) of the distribution.

### Numerator

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Numerator/>

**语法：**

```
Numerator( <Function> )
Numerator( <Number> )
Numerator( <Expression> )
```

**说明 / 示例：**

Returns the numerator of the function.  
Numerator((3x² + 1) / (2x - 1)) yields f(x) = 3x² + 1.  
For a rational number returns its (simplified) numerator. It uses a numerical method, which limits this command to numbers with  
small denominator. For irrational input the numerator of its continued fraction  
is returned.  
Numerator(5 / 3) yields 5.  
Numerator(10 / 6) yields 5.  
Numerator(15 / 3) yields 5.  
See also Denominator Command and FractionText  
Command.  
CAS Syntax  
Returns the numerator of a rational number or expression.  
Numerator(2/3 + 1/15) yields 11.  
If variables a, b and c haven’t been previously defined in GeoGebra, then Numerator(a/b) yields a and  
Numerator(Simplify(a + b/c)) yields a c + b

### Numeric

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Numeric/>

**语法：**

```
Numeric( <Expression> )
Numeric( <Expression>, <Significant Figures> )
```

**说明 / 示例：**

CAS Syntax  
Tries to determine a numerical approximation of the given expression. The number of decimals depends on the global  
rounding you choose in the Options Menu.  
Numeric(3 / 2) yields 1.5.  
Tries to determine a numerical approximation of the given expression, using the entered number of significant figures.  
Numeric(sin(1), 20) yields 0.84147098480789650665.  
If you don’t specify enough digits then you can get an apparently wrong answer due to  
floating point cancelation.  
Numeric(-500000000/785398163*sin(785398163/500000000)1258025227.19^2+500000000/7853981631258025227.19^2,10) will  
give 4096 but  
Numeric(-500000000/785398163*sin(785398163/500000000)*1258025227.19^2+500000000/785398163*1258025227.19^2,30) will  
give 0.318309886345536696694580314215.  
See also Numeric tool.

### PartialFractions

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/PartialFractions/>

**语法：**

```
PartialFractions( <Function> )
PartialFractions( <Function>, <Variable> )
```

**说明 / 示例：**

Yields, if possible, the partial fraction of the given function for the  
main function variable. The graph of the function is plotted in the Graphics View.  
PartialFractions(x^2 / (x^2 - 2x + 1)) yields 1 + (\frac{1}{(x - 1)²}) + (\frac{2}{x-1}).  
Hint: In the CAS View you can also use the following syntax:  
Yields, if possible, the partial fraction of the given function for the given function variable.  
PartialFractions(a^2 / (a^2 - 2a + 1), a) yields 1 + (\frac{1}{(a - 1)²}) + (\frac{2}{(a-1)}).

### Pascal

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Pascal/>

**语法：**

```
Pascal( <n>, <p> )
Pascal( <n>, <p>, <Boolean Cumulative> )
Pascal( <n>, <p>, <Variable Value>, <Boolean Cumulative> )
```

**说明 / 示例：**

Returns a bar graph of a Pascal distribution.  
The Pascal distribution models the number of failures before the nth success in repeated mutually independent  
Bernoulli trials, each with probability of success p.  
Returns a bar graph of a Pascal distribution when Cumulative = false.  
Returns a graph of a cumulative Pascal distribution when Cumulative = true.  
First two parameters are same as above.  
Let X be a Pascal random variable and v the variable value.  
Returns P( X = v) when Cumulative = false.  
Returns P( X ≤ v) when Cumulative = true.  
First two parameters are same as above.  
If the number of independent Bernoulli trials that must be successful is n = 1, the probability of success in one trial  
is p = (\frac{1}{6}), then the probability of 2 failures before the success is given by  
Pascal(1, 1/6, 2, false) which yields 0.12 in the Algebra View and 25/216 in the  
CAS View.  
This command also works in the  
CAS View.

### PerpendicularVector

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/PerpendicularVector/>

**语法：**

```
PerpendicularVector( <Line> )
PerpendicularVector( <Segment> )
PerpendicularVector( <Vector> )
PerpendicularVector( <Plane> )
```

**说明 / 示例：**

Returns one of the perpendicular vector to the line.  
Let Line((1, 4), (5, -3)) be the line j. PerpendicularVector(j) yields vector u=(7, 4).  
The components of the perpendicular vector to a line of equation ax + by = c are (a, b).  
Returns one of the perpendicular vector to the segment, having the same length.  
Let Segment((3, 2), (14, 5)) be the segment k. PerpendicularVector(k) yields vector u=(-3, 11).  
Returns one of the perpendicular vector to the given vector.  
Let Vector((-12, 8)) be the vector u. PerpendicularVector(u) yields vector v=(-8, -12).  
If a point is specified in the definition of the line, segment, or vector, the perpendicular vector will originate from that point. Otherwise, the origin will be at (0, 0).  
If point A is (1, 4) and point B is (5, -3), let Line(A, B) be the line i,PerpendicularVector(i) will have its origin at A.  
Let Line((1, 4), (5, -3)) be the line j. PerpendicularVector(j) will have its origin at (0, 0).  
In the CAS View undefined  
variables are allowed as well.  
PerpendicularVector((a, b)) yields the vector {-b, a}.  
Creates a vector orthogonal to the plane, with starting point at (0,0,0).  
PerpendicularVector(xOyPlane) yields the perpendicular vector u=(0, 0, 1) to the xOy plane.  
See also UnitPerpendicularVector Command.

### PlotSolve

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/PlotSolve/>

**语法：**

```
PlotSolve( <Equation in x> )
```

**说明 / 示例：**

Solves a given equation for the main variable and returns a list of all solutions and the graphical output in the  
Graphics View.  
PlotSolve(x^2 = 4x) yields {(0, 0), (4, 0)} and displays the points (0, 0) and (4, 0) in the Graphics View.

### Poisson

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Poisson/>

**语法：**

```
Poisson( <Mean> )
Poisson( <Mean>, <Boolean Cumulative> )
Poisson( <Mean>, <Variable Value v>, <Boolean Cumulative> )
```

**说明 / 示例：**

Returns a bar graph of a Poisson distribution with given mean λ.  
Returns a bar graph of a Poisson distribution when Cumulative = false.  
Returns a graph of a cumulative Poisson distribution when Cumulative = true.  
The first parameter is same as above.  
Let X be a Poisson random variable.  
Returns P( X = v) when Cumulative = false.  
Returns P( X ≤ v) when Cumulative = true.  
First parameter is same as above.  
Poisson(3, 1, true) yields 0.2 in the Algebra View and (\frac{4}{e³}) in the CAS View.  
Poisson(3, 1, false) yields 0.15 in the Algebra View and (\frac{3}{e³}) in the CAS View.  
A simplified syntax is available to calculate P(u ≤ X ≤ v): e.g. Poisson(1, 1..5) yields 0.63153, that is  
the same as Poisson(1, {1, 2, 3, 4, 5}).

### Polynomial

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Polynomial/>

**语法：**

```
Polynomial( <Function> )
Polynomial( <List of Points> )
Polynomial( <Function>, <Variable> )
```

**说明 / 示例：**

Expands the expression of a polynomial function and simplifies the result.  
Polynomial((x - 3)^2) yields x2 - 6x + 9.  
Polynomial(y^2+(x+y)^2) yields x2 + 2xy + 2y2.  
Polynomial(2x³ - 1 x² + 0x + 4) yields 2x³ - x² + 4.  
Creates the interpolation polynomial of degree n-1 through the given n points.  
Polynomial({(1, 1), (2, 3), (3, 6)}) yields 0.5 x2 + 0.5 x.  
CAS Syntax  
Expands the function and writes it as a polynomial in x (grouping the coefficients).  
Polynomial((x - 3)^2 + (a + x)^2) yields 2 x2 + (2a - 6) x + a2 + 9.  
Expands the function and writes it as a polynomial in the variable (grouping the coefficients).  
Polynomial((x - 3)^2 + (a + x)^2, a) yields a2 + 2 x a + 2 x2 - 6 x + 9.

### PreviousPrime

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/PreviousPrime/>

**语法：**

```
PreviousPrime( <Number> )
```

**说明 / 示例：**

Returns the greatest prime smaller than the entered number.  
PreviousPrime(10000) yields 9973.  
See also NextPrime Command.

### PrimeFactors

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/PrimeFactors/>

**语法：**

```
PrimeFactors( <Number> )
```

**说明 / 示例：**

Returns the list of primes whose product is equal to the given number.  
PrimeFactors(1024) yields {2, 2, 2, 2, 2, 2, 2, 2, 2, 2}.  
PrimeFactors(42) yields {2, 3, 7}.  
CAS Syntax  
Returns the list of primes whose product is equal to the given number.  
PrimeFactors(1024) yields {2, 2, 2, 2, 2, 2, 2, 2, 2, 2}.  
PrimeFactors(42) yields {2, 3, 7}.  
See also Factor command.

### Product

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Product/>

**语法：**

```
Product( <List of Raw Data> )
Product( <List of Numbers>, <Number of Elements> )
Product( <List of Numbers>, <List of Frequencies> )
Product( <Expression>, <Variable>, <Start Value>, <End Value> )
Product( <List of Expressions> )
```

**说明 / 示例：**

Calculates the product of all numbers in the list.  
Product({2, 5, 8}) yields 80.  
Calculates the product of the first n elements in the list.  
Product({1, 2, 3, 4}, 3) yields 6.  
Calculates the product of all elements in the list of numbers raised to the value given in the list of frequencies  
for each one of them.  
Product({20, 40, 50, 60}, {4, 3, 2, 1}) yields 1536000000000000  
Product({sqrt(2), cbrt(3), sqrt(5), cbrt(-7)}, {4, 3, 2, 3}) yields -420  
The two lists must have the same length.  
Calculates the product of the expressions that are obtained by replacing the given variable with every integer from the given  
start to the given end values.  
Product(k, k, 1, 7) yields 5040  
Product(x + k, k, 2, 3) yields f(x)=(x + 2)(x + 3).  
CAS Syntax  
Calculates the product of all elements in the list.  
Product({1, 2, x}) yields 2x.  
Calculates the product of the expressions that are obtained by replacing the given variable with every integer from the given  
start to the given end values.  
Product(x + 1, x, 2, 3) yields 12.

### QRDecomposition

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/QRDecomposition/>

**语法：**

```
QRDecomposition( <Matrix> )
```

**说明 / 示例：**

CAS Syntax  
Calculates the QR decomposition of the given matrix.  
QRDecomposition({{1,2},{3,4}}) returns the matrices  
(\begin{pmatrix}\frac{1}{\sqrt{10}}&\frac{3/5}{\sqrt{10}/5}\\\frac{3}{\sqrt{10}}&-\frac{1/5}{\sqrt{10}/5}\end{pmatrix}) and  
(\begin{pmatrix}\sqrt{10}&7/5\sqrt{10}\0&\sqrt{10}/5\end{pmatrix}).  
See also LUDecomposition command.

### RandomBetween

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/RandomBetween/>

**语法：**

```
RandomBetween( <Minimum Integer> , <Maximum Integer> )
RandomBetween( <Minimum Integer> , <Maximum Integer> , <Boolean Fixed> )
RandomBetween( <Minimum Integer> , <Maximum Integer>, <Number of Samples> )
```

**说明 / 示例：**

Generates a random integer between minimum and maximum (inclusive).  
RandomBetween(0, 10) yields a number between 0 and 10 (inclusive)  
If Boolean Fixed = "true", it generates a random integer between minimum and maximum (inclusive), which is  
updated just once (when file is loaded and also on undo/redo).  
RandomBetween(0, 10, true) yields a number between 0 and 10 (inclusive)  
Press F9 to see the difference between those two syntaxes.  
Generates a list of random integers between minimum and maximum (inclusive). The number of random integers in the  
list is the number of samples.  
RandomBetween(0, 10, 5) yields {1,3,4,8,2}, or {7,5,6,1,7}, etc.  
See also SetSeed command, RandomElement command,  
RandomBinomial command, RandomNormal command,  
RandomPoisson command, RandomUniform command.

### RandomBinomial

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/RandomBinomial/>

**语法：**

```
RandomBinomial( <Number of Trials>, <Probability> )
```

**说明 / 示例：**

Generates a random number from a binomial distribution with n trials and probability p.  
RandomBinomial(3, 0.1) gives j ∈ {0, 1, 2, 3}, where the probability of getting j is the probability of an  
event with probability 0.1 occurring j times in three tries.  
See also SetSeed command, RandomBetween command,  
RandomElement command, RandomNormal command,  
RandomPoisson command, RandomUniform command.

### RandomElement

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/RandomElement/>

**语法：**

```
RandomElement( <List> )
```

**说明 / 示例：**

Returns randomly chosen element from the list (with uniform probability). All elements in the list  
must be of the same type.  
RandomElement({3, 2, -4, 7}) yields one of {-4, 2, 3, 7}.  
Hint: In the CAS View this command also works with symbolic input.  
RandomElement({a,b,c,d}) yields one of {a, b, c, d}.  
See also Element Command, SetSeed Command,  
RandomBetween Command, RandomBinomial Command,  
RandomNormal Command, RandomPoisson Command and  
RandomUniform Command.

### RandomNormal

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/RandomNormal/>

**语法：**

```
RandomNormal( <Mean>, <Standard Deviation> )
```

**说明 / 示例：**

Generates a random number from a normal distribution with given mean and standard deviation.  
RandomNormal(3, 0.1) yields a random value from a normal distribution with a mean of 3 and standard deviation of  
0.1.  
See also SetSeed command, RandomBetween command,  
RandomElement command, RandomBinomial command,  
RandomPoisson command, RandomUniform command.

### RandomPoisson

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/RandomPoisson/>

**语法：**

```
RandomPoisson( <Mean> )
```

**说明 / 示例：**

Generates a random number from a Poisson distribution with given mean.  
RandomPoisson(3) yields a random value from a Poisson distribution with a mean of 3.  
See also SetSeed command, RandomBetween command,  
RandomElement command, RandomBinomial command,  
RandomNormal command, RandomUniform command.

### RandomPolynomial

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/RandomPolynomial/>

**语法：**

```
RandomPolynomial( <Degree> , <Minimum for Coefficients>, <Maximum for Coefficients> )
RandomPolynomial( <Variable>, <Degree> , <Minimum for Coefficients>, <Maximum for Coefficients> )
```

**说明 / 示例：**

Returns a randomly generated polynomial in x of degree d, whose (integer) coefficients are in the range from  
minimum to maximum, both included.  
RandomPolynomial(0, 1, 2) yields either 1 or 2.  
RandomPolynomial(2, 1, 2) yields a random polynomial with a degree of two and only 1 and 2 as coefficients,  
for example 2x2 + x + 1.  
CAS Syntax  
The following command is only available in the  
CAS View.  
Returns a randomly generated polynomial in Variable of degree d, whose (integer) coefficients are in the range  
from minimum to maximum, both included.  
RandomPolynomial(a, 0, 1, 2) yields either 1 or 2.  
RandomPolynomial(a, 2, 1, 2) yields a random polynomial with a degree of two and only 1 and 2 as  
coefficients, for example 2a2 + a + 1.  
In both cases if minimum or maximum are not integers, round(minimum) and round(maximum) are used instead.

### RandomUniform

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/RandomUniform/>

**语法：**

```
RandomUniform( <Min>, <Max> )
RandomUniform( <Min>, <Max>, <Number of Samples n> )
```

**说明 / 示例：**

Returns random real number from uniform distribution  
on interval [min, max].  
RandomUniform(0, 1) returns a random number between 0 and 1  
Returns a list of n random real numbers from uniform  
distribution on interval [min, max].  
RandomUniform(0, 1, 3) returns a list of three random numbers between 0 and 1  
RandomUniform(0,1) is equivalent to random() (see Predefined  
Functions and Operators).  
See also SetSeed, RandomBetween,  
RandomElement, RandomBinomial,  
RandomNormal , RandomPoisson commands.

### Rationalize

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Rationalize/>

**语法：**

```
Rationalize( <Number> )
```

**说明 / 示例：**

This command differs among variants of English:  
Rationalize (US)  
Rationalise (UK + Aus)  
CAS Syntax  
Creates the fraction of the given Number, and rationalizes the denominator, if it contains square roots.  
Rationalize(3.5) yields (\frac{7}{2}).  
Rationalize(1/sqrt(2)) yields (\frac{\sqrt{2} }{2}).  
See also MixedNumber Command.

### ReducedRowEchelonForm

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/ReducedRowEchelonForm/>

**语法：**

```
ReducedRowEchelonForm( <Matrix> )
```

**说明 / 示例：**

Returns the reduced echelon form of the matrix.  
ReducedRowEchelonForm({{1, 6, 4}, {2, 8, 9}, {4, 5, 6}}) yields the matrix ( \begin{pmatrix} 1 & 0 & 0 \  
0 & 1 & 0 \ 0 & 0 & 1 \end{pmatrix}).  
ReducedRowEchelonForm({{2, 10, 11, 4}, {2, (-5), (-6), 12}, {2, 5, 3, 2}}) yields the matrix (  
\begin{pmatrix} 1 & 0 & 0 & 5\ 0 & 1 & 0 & -2.8\ 0 & 0 & 1 & 2\end{pmatrix}).  
CAS Syntax  
Returns the reduced echelon form of the matrix.  
ReducedRowEchelonForm({{1, 6, 4}, {2, 8, 9}, {4, 5, 6}}) yields the matrix ( \begin{pmatrix} 1 & 0 & 0 \  
0 & 1 & 0 \ 0 & 0 & 1 \end{pmatrix}).  
ReducedRowEchelonForm({{2, 10, 11, 4}, {2, (-5), (-6), 12}, {2, 5, 3, 2}}) yields the matrix (  
\begin{pmatrix} 1 & 0 & 0 & 5\ 0 & 1 & 0 & \frac{-14}{5} \ 0 & 0 & 1 & 2\end{pmatrix}).

### RightSide

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/RightSide/>

**语法：**

```
RightSide( <Equation> )
RightSide( <List of Equations> )
RightSide( <List of Equations>, <Index> )
```

**说明 / 示例：**

Gives the right-hand side of the simplified equation.  
RightSide(x + 2 = 3x + 1) yields 0.5  
CAS Syntax  
Gives the right-hand side of the equation.  
RightSide(x + 3 = 3 x + 1) yields 3 x + 1.  
Gives the list of the right-hand sides of the equations.  
RightSide({a^2 + b^2 = c^2, x + 2 = 3x + 1}) yields {c2, 3x + 1}.  
Gives the right-hand sides of the equation specified by the index.  
RightSide({a^2 + b^2 = c^2, x + 2 = 3 x + 1}, 1) yields (c^2).  
See also LeftSide Command.

### Root

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Root/>

**语法：**

```
Root( <Polynomial> )
Root( <Function>, <Initial x-Value> )
Root( <Function>, <Start x-Value>, <End x-Value> )
```

**说明 / 示例：**

Yields all roots of the polynomial as intersection points of the function graph and the x‐axis.  
Root(0.1*x^2 - 1.5*x + 5) yields A = (5, 0) and B = (10, 0).  
Yields one root of the function using the initial value a for a numerical iterative method.  
Root(0.1*x^2 - 1.5*x + 5, 6) yields A = (5, 0).  
Let a be the Start x-Value and b the End x-Value . This command yields one root of the function in the  
interval [a, b] using a numerical iterative method.  
Root(0.1x² - 1.5x + 5, 8, 13) yields A = (10, 0).  
CAS Syntax  
Yields all roots of the polynomial as a list.  
Root(x^3 - 3 \* x^2 - 4 \* x + 12) yields {x = -2, x = 2, x = 3}.  
In the CAS View, this  
command is only a special variant of Solve Command.

### RootList

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/RootList/>

**语法：**

```
RootList( <List> )
```

**说明 / 示例：**

Converts a given list of numbers {a1,a2,…,an} to a list of points {(a1,0),(a2,0),…,(an,0)}, which is  
also displayed in the  
Graphics View.  
Command RootList({3, 4, 5, 2, 1, 3}) returns the list of points list1={(3,0), (4,0), (5,0), (2,0), (1,0),  
(3,0)}

### SD

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/SD/>

**语法：**

```
SD( <List of Raw Data> )
SD( <List of Numbers>, <List of Frequencies> )
```

**说明 / 示例：**

Calculates the standard deviation of the numbers in the list.  
This command has also the equivalent syntax stdevp( <List of Raw Data> ).  
SD({1, 2, 3, 4, 5}) yields 1.41  
stdevp({1, 2, 3, 4, 5}) yields 1.41  
Calculates the weighted standard deviation of the given numbers.  
This command has also the equivalent syntax stdevp( <List of Numbers>, <List of Frequencies> ).  
SD({1, 2, 3, 4, 5}, {5, 4, 3, 2, 1}) yields 1.25  
stdevp({1, 2, 3, 4, 5}, {5, 4, 3, 2, 1}) yields 1.25  
CAS Syntax  
Calculates the standard deviation of the numbers in the list.  
This command has also the equivalent syntax stdevp( <List of Raw Data> ).  
SD({1, 2, 3, 4, 5}) yields (\sqrt{2}).  
stdevp({1, 2, 3, 4, 5}) yields (\sqrt{2}).  
SD({-3 + 2 x, -1- 4 x, -2 + 5 x^2}) is evaluated as ( \sqrt{2}  
\frac{\sqrt{25x⁴ + 10x³ + 28x² - 18x + 3} } { 3 } ).  
Calculates the weighted standard deviation of the given numbers.  
This command has also the equivalent syntax stdevp( <List of Numbers>, <List of Frequencies> ).  
SD({1, 2, 3, 4, 5}, {5, 4, 3, 2, 1}) yields (\frac{\sqrt{14}}{3})  
stdevp({1, 2, 3, 4, 5}, {5, 4, 3, 2, 1}) yields (\frac{\sqrt{14}}{3})  
See also Mean Command.

### Sample

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Sample/>

**语法：**

```
Sample( <List>, <Size> )
Sample( <List>, <Size>, <With Replacement> )
```

**说明 / 示例：**

Returns list of n randomly chosen elements of a list; elements can be chosen several times.  
Sample({1, 2, 3, 4, 5}, 5) yields for example list1 = {1, 2, 1, 5, 4}.  
Returns list of n randomly chosen elements of a list. Elements can be chosen several times if and only if the last  
parameter is true.  
Sample({1, 2, 3, 4, 5}, 5, true) yields for example list1 = {2, 3, 3, 4, 5}.  
In the CAS View the input list can contain different types of objects:  
Sample({-5, 2, a, 7, c}, 3) yields for example {a, 7, -5}.  
The list can include lists as well: Let List1 be {1, 2, 3}: Sample({List1, 4, 5, 6, 7, 8}, 3, false) yields  
for example {6, {1, 2, 3}, 4}.

### SampleSD

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/SampleSD/>

**语法：**

```
SampleSD( <List of Raw Data> )
SampleSD( <List of Numbers>, <List of Frequencies> )
```

**说明 / 示例：**

Returns the sample standard deviation of the given  
list of numbers.  
This command has also the equivalent syntax stdev( <List of Raw Data> ).  
SampleSD({1, 2, 3}) yields 1.  
stdev({1, 2, 3}) yields 1.  
Returns the sample standard deviation of the numbers in the given list, having the specified frequencies.  
This command has also the equivalent syntax stdev( <List of Numbers>, <List of Frequencies> ).  
SampleSD({1, 2, 3, 4},{1, 1, 1, 2}) yields 1.3.  
stdev({1, 2, 3, 4},{1, 1, 1, 2}) yields 1.3.  
If the list contains undefined variables in the CAS View, the command yields  
a formula for the sample standard deviation.  
SampleSD({1, 2, a}) yields (\frac{\sqrt{a²-3a+3}}{\sqrt{3}}).

### SampleVariance

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/SampleVariance/>

**语法：**

```
SampleVariance( <List of Raw Data> )
SampleVariance( <List of Numbers>, <List of Frequencies> )
```

**说明 / 示例：**

Returns the sample variance of the given list of numbers.  
SampleVariance({1, 2, 3, 4, 5}) yields a = 2.5.  
Returns the sample variance of the given list of numbers with the specified frequencies.  
SampleVariance({1, 2, 3, 4, 5}, {3, 2, 4, 4, 1}) yields a = 1.67.  
If the list in the CAS View  
contains undefined variables, this command yields a formula for the sample variance.  
SampleVariance({a, b, c}) yields (\frac{1}{3} a^{2} - \frac{1}{3} ab - \frac{1}{3}ac + \frac{1}{3}  
b^{2} - \frac{1}{3} bc + \frac{1}{3} c^{2}).

### Sequence

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Sequence/>

**语法：**

```
Sequence( <End Value > )
Sequence( <Start value k >, <End value n > )
Sequence( <Start value k>, <End value n>, <Increment> )
Sequence( <Expression>, <Variable k>, <Start Value a>, <End Value b> )
Sequence( <Expression>, <Variable k>, <Start Value a>, <End Value b>, <Increment> )
```

**说明 / 示例：**

Creates a list of integers from 1 to the given end value.  
Sequence(4) creates the list {1, 2, 3, 4}.  
2^Sequence(4) creates the list {2, 4, 8, 16}.  
Creates a list of integers from k to n (increasing or decreasing).  
Sequence(7,13) creates the list {7, 8, 9, 10, 11, 12, 13}  
Sequence(18,14) creates the list {18, 17, 16, 15, 14}  
Sequence(-5, 5) creates the list {-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5}.  
This syntax can be further simplified: instead of using e.g. the formal Sequence(7,13) it is possible to obtain  
the same result by typing in the input bar 7..13 .  
Creates a list of integers from k to n using the given increment.  
Sequence(7,13,2) creates the list {7, 9, 11, 13}  
Sequence(7,13,4) creates the list {7, 11}  
Yields a list of objects created using the given expression and the index k that ranges from start value a to end  
value b.  
Sequence((2, k), k, 1, 5) creates a list of points whose y-coordinates range from 1 to 5: {(2, 1), (2, 2),  
(2, 3), (2, 4), (2, 5)}  
Sequence(x^k, k, 1, 10) creates the list {x, x², x³, x⁴, x⁵, x⁶, x⁷, x⁸, x⁹, x¹⁰}  
Yields a list of objects created using the given expression and the index k that ranges from start value a to end  
value b with given increment.  
Sequence((2, k), k, 1, 3, 0.5) creates a list of points whose y-coordinates range from 1 to 3 with an  
increment of 0.5: {(2, 1), (2, 1.5), (2, 2), (2, 2.5), (2, 3)}  
Sequence(x^k, k, 1, 10, 2) creates the list {x, x³, x⁵, x⁷, x⁹}.  
Since the parameters a and b are dynamic you could use slider variables in both cases above as well.  
See Lists for more information on list operations.

### Shuffle

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Shuffle/>

**语法：**

```
Shuffle( <List> )
```

**说明 / 示例：**

Returns list with same elements, but in random order.  
You can recompute the list via Recompute all objects in  
View Menu (or pressing F9).  
See also RandomElement Command and RandomBetween  
Command.  
CAS Syntax  
Returns list with same elements, but in random order.  
Shuffle({3, 5, 1, 7, 3}) yields for example {5, 1, 3, 3, 7}.  
Shuffle(Sequence(20)) gives the first 20 whole numbers in a random order.

### Simplify

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Simplify/>

**语法：**

```
Simplify( <Function> )
Simplify( <Text> )
```

**说明 / 示例：**

Simplifies the terms of the given function, if possible.  
Simplify(x + x + x) yields the function f(x) = 3x.  
Attempts to tidy up text expressions by removing repeated negatives etc.  
For a = b = c = -1 Simplify("f(x) = " + a + "x² + " + b + "x + " + c) yields the text f(x) = -x2 - x -  
1\.  
The FormulaText Command normally produces better results and is simpler.  
This command needs to load the Computer Algebra System, so can be slow on some computers. Try using the  
Polynomial Command instead.  
CAS Syntax  
Simplifies the terms of the given function, if possible. Undefined variables can be included in the terms.  
Simplify(3 \* x + 4 \* x + a \* x) yields a x + 7x.  
Assume(x<2,Simplify(sqrt(x-2sqrt(x-1)))) yields -sqrt(abs(x - 1)) + 1  
Assume(x>2,Simplify(sqrt(x-2sqrt(x-1)))) yields sqrt(x - 1) + 1  
See also Factor Command, Assume Command,  
PartialFractions Command, Expand Command,  
Polynomial Command.

### Solutions

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Solutions/>

**语法：**

```
Solutions( <Equation> )
Solutions( <Equation>, <Variable> )
Solutions( <List of Equations>, <List of Variables> )
```

**说明 / 示例：**

Starting from version 823 this command behaves as Solve command, except for the format of the  
result: command Solutions returns a list of values, while command Solve returns a list of equations in the form  
variable name = value.  
Solves a given equation for the main variable and returns a list of all solutions.  
Solutions(x^2 = 4x) yields {0, 4}.  
CAS Syntax  
Solves an equation for a given unknown variable and returns a list of all solutions.  
Solutions(x * a^2 = 4a, a) yields {(\frac{4}{x},0)}.  
Solves a set of equations for a given set of unknown variables and returns a list of all solutions.  
Solutions({x = 4 x + y , y + x = 2}, {x, y}) yields {{-1, 3}}, the sole solution of x = 4x + y and y + x  
= 2, displayed as (\begin{pmatrix}-1&3\end{pmatrix}).  
Solutions({2a^2 + 5a + 3 = b, a + b = 3}, {a, b}) yields {{-3, 6}, {0, 3}}, displayed as  
(\begin{pmatrix}-3&6\0&3\end{pmatrix}).  
Sometimes you need to do some manipulation to allow the automatic solver to work, for example  
Solutions(TrigExpand(sin(5/4 π + x) - cos(x - 3/4 π) = sqrt(6) * cos(x) - sqrt(2)))  
See also Solve Command.

### Solve

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Solve/>

**语法：**

```
Solve( <Equation in x> )
Solve( <Equation>, <Variable> )
Solve( <Equation in x>, <Assumption> )
Solve( <List of Equations>, <List of Variables> )
Solve( <Equation>, <Variable> , <List of assumptions>)
Solve( <List of Parametric Equations>, <List of Variables> )
```

**说明 / 示例：**

Commands Solve and Solutions solve an equation or a system of equations over the real  
numbers symbolically. To solve equations numerically, use the NSolve Command. For solving  
equations in complex numbers see CSolve Command.  
Solves a given equation for the main variable and returns a list of all solutions.  
Solve(x^2 = 4x) yields {x = 4, x = 0}, the solutions of x2 = 4x.  
CAS Syntax  
The following commands are only available in the  
CAS View.  
Solves an equation for a given unknown variable and returns a list of all solutions.  
Solve(x * a^2 = 4a, a) yields {(a = \frac{4}{x}, a = 0)}.  
Solves an equation x, conditional on the assumption  
Solve(x^2=1, x>0) yields ({x = 1})  
Solves a set of equations for a given set of unknown variables and returns a list of all solutions.  
Solve({x = 4 x + y , y + x = 2}, {x, y}) yields {{ x = -1, y = 3 }}  
Solve({2a^2 + 5a + 3 = b, a + b = 3}, {a, b}) yields {{a = 0, b = 3}, {a = -3, b = 6}}.  
Solves an equation for a given unknown variable with the list of assumptions and returns a list of all solutions.  
Solve(u *x < a,x, u>0) yields {x < a / u}, the solution of u *x < a assuming that u>0  
Solve(u x < a,x, {u<0, a<0}) yields {x > a / u}.  
Solves a set of parametric equations for a given set of unknown variables and returns a list of all solutions.  
Solve({(x, y) = (3, 2) + t(5, 1), (x, y) = (4, 1) + s*(1, -1)}, {x, y, t, s}) yields {{x = 3, y = 2, t = 0,  
s = -1}}.  
The right hand side of equations (in any of the above syntaxes) can be omitted. If the right hand side is missing, it  
is treated as 0.  
Sometimes you need to do some manipulation to allow the automatic solver to work, for example  
Solve(TrigExpand(sin(5/4 π + x) - cos(x - 3/4 π) = sqrt(6) * cos(x) - sqrt(2))).  
For piecewise-defined functions, you will need to use NSolve

### SolveCubic

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/SolveCubic/>

**语法：**

```
SolveCubic( <Cubic Polynomial> )
```

**说明 / 示例：**

CAS Syntax  
Solves a given cubic polynomial and returns a list of all solutions.  
SolveCubic(x³ - 1) yields { 1, ( \frac{1}{2} (\sqrt{3} i -1) ) , ( \frac{1}{2} (\sqrt{3} (-i) -1)  
) } .  
Often the answers are cumbersome, e.g. SolveCubic(x³ + x² + x + 2) in which case Solve(x³ + x² + x + 2)  
or CSolve(x³ + x² + x + 2) may work better for you.

### SolveODE

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/SolveODE/>

**语法：**

```
SolveODE( <f'(x, y)> )
SolveODE( <f'(x, y)>, <Point on f> )
SolveODE( <f'(x, y)>, <Start x>, <Start y>, <End x>, <Step> )
SolveODE( <y'>, <x'>, <Start x>, <Start y>, <End t>, <Step> )
SolveODE( <b(x)>, <c(x)>, <f(x)>, <Start x>, <Start y>, <Start y'>, <End x>, <Step> )
SolveODE( <Equation> )
SolveODE( <Equation>, <Point(s) on f> )
SolveODE( <Equation>, <Point(s) on f>, <Point(s) on f'> )
SolveODE( <Equation>, <Dependent Variable>, <Independent Variable>, <Point(s) on f> )
SolveODE( <Equation>, <Dependent Variable>, <Independent Variable>, <Point(s) on f>, <Point(s) on f'> )
```

**说明 / 示例：**

Attempts to find the exact solution of the first order ordinary differential equation (ODE)  
(\frac{dy}{dx}(x)=f'(x, y(x))).  
SolveODE(2x / y) yields (\sqrt{2} \sqrt{-c\_{1}+x^{2}}), where (c\_{1}) is a constant.  
(c\_{1}) will be created as an auxiliary object with a corresponding slider.  
Attempts to find the exact solution of the first order ODE (\frac{dy}{dx}(x)=f'(x, y(x))) and returns the solution  
through the given point (Cauchy problem).  
SolveODE(y / x, (1, 2)) yields y = 2x.  
Solves first order ODE (\frac{dy}{dx}=f'(x, y)) numerically with given start point, end and step for x.  
SolveODE(-x*y, x(A), y(A), 5, 0.1) solves (\frac{dy}{dx}=-xy) using previously defined A as a starting  
point.  
Length(  ) allows you to find out how many points are in the computed locus.  
First( ,  ) allows you to extract the points as a list.  
To find the "reverse" solution, just enter a negative value for End x, for example  
SolveODE(-x*y, x(A), y(A), -5, 0.1)  
Solves first order ODE (\frac{dy}{dx}=\frac{f(x, y)}{g(x, y)}) with given start point, maximal value of an  
internal parameter t and step for t. This version of the command may work where the first one fails e.g. when the  
solution curve has vertical points.  
SolveODE(-x, y, x(A), y(A), 5, 0.1) solves (\frac{dy}{dx}=- \frac{x}{y} ) using previously defined A as  
a starting point.  
To find the "reverse" solution, just enter a negative value for End t, for example  
SolveODE(-x, y, x(A), y(A), -5, 0.1).  
Solves second order ODE (y'' + b(x) y' + c(x) y = f(x)).  
SolveODE(x^2, 2x, 2x^2 + x, x(A), y(A), 0, 5, 0.1) solves the second order ODE using previously defined A as a  
starting point.  
Always returns the result as locus. The algorithms are currently based on  
Runge-Kutta numeric methods.  
See also SlopeField command.  
CAS Syntax  
Attempts to find the exact solution of the first or second order ODE. For first and second derivative of y you can  
use y' and y'' respectively.  
SolveODE(y' = y / x) yields y = c1 x.  
Attempts to find the exact solution of the given first or second order ODE which goes through the given point or list of points.  
SolveODE(y' = y / x, (1, 2)) yields y = 2x.  
Attempts to find the exact solution of the given first or second order ODE and goes through the given point (or list of points) on f  
and f' goes through the given point (or list of points) on f' .  
SolveODE(y'' - 3y' + 2 = x, (2, 3), (1, 2)) yields ( y = \frac{-9 x^2 e^3 + 30 x e^3 - 32 {(e^3)}^2 + 138  
e^3 + 32 e^{3 x} }{54 e^3} ).  
Attempts to find the exact solution of the given first or second order ODE which goes through the given point (or list of points).  
SolveODE(v' = v / w, v, w, (1, 2)) yields v = 2w.  
Attempts to find the exact solution of the given first or second order ODE which goes through the given point (or list of points) on  
f and f' goes through the given point (or list of points) on f' .  
SolveODE(v' = v / w, v, w, (1, 2), (0, 2)) yields v = 2w.  
For compatibility with input bar, if the first parameter is just an expression without y' or y'', it is supposed to  
be right hand side of ODE with left hand side y'.

### SolveQuartic

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/SolveQuartic/>

**语法：**

```
SolveQuartic( <Quartic Polynomial> )
```

**说明 / 示例：**

This page is about a feature that is supported only in GeoGebra beta.  
CAS Syntax  
Solves a given quartic polynomial and returns a list of all solutions.  
SolveQuartic( x^4 + x^3 + x^2 + x ) yields {0, -1, i, -i }

### Substitute

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Substitute/>

**语法：**

```
Substitute( <Expression>, <from>, <to> )
Substitute( <Expression>, <Substitution List> )
```

**说明 / 示例：**

CAS Syntax  
Replaces in expression all occurrences of from with to and evaluates the result when variables are substituted with values.  
Substitute((3 m - 3)^2 - (m + 3)^2, m, a) yields 8 a2 - 24 a.  
Substitute((3 m - 3)^2 - (m + 3)^2, m, 2) yields -16.  
Replaces in expression every occurrence of the variables in the substitution list with the corresponding terms or values, and evaluates numerical substitutions.  
Substitute(2x + 3y - z, {x = a, y = 2, z = b}) yields 2a - b + 6.  
Substitute(2x + 3y - z, x = a, y = 2, z = b) yields 2a - b + 6.

### Sum

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Sum/>

**语法：**

```
Sum( <List> )
Sum( <List>, <Number of Elements> )
Sum( <List>, <List of Frequencies> )
Sum( <Expression>, <Variable>, <Start Value>, <End Value> )
```

**说明 / 示例：**

Calculates the sum of all the elements in the list.  
Sum({1, 2, 3}) yields the number a = 6.  
Sum({x^2, x^3}) yields f(x) = x2 + x3.  
Sum(Sequence(i, i, 1, 100)) yields the number a = 5050.  
Sum({(1, 2), (2, 3)}) yields the point A = (3, 5).  
Sum({"a", "b", "c"}) yields the text "abc".  
Calculates the sum of the first n elements in the list.  
Sum({1, 2, 3, 4, 5, 6}, 4) yields the number a = 10.  
Returns the sum of the given list of values, considering the related frequencies.  
Sum({1, 2, 3, 4, 5}, {3, 2, 4, 4, 1}) yields a = 40.  
This command works for numbers, points, vectors, text, and functions.  
Lists must contain objects of the same type.  
CAS Syntax  
The following command works only in the  
CAS View.  
Computes the sum (\sum\_{t=Start Value}^{End Value}f(t)). End value can also be infinity.  
Sum(n^2, n, 1, 3) yields 14.  
Sum(r^k, k, 0, n) yields (\frac{r^{n+1} }{r - 1} - \frac{1}{r - 1}).  
Sum((1/3)^n, n, 0, Infinity) yields (\frac{3}{2}).

### SVD

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/SVD/>

**语法：**

```
SVD( <Matrix> )
```

**说明 / 示例：**

Returns the Singular Value Decomposition of the matrix (as  
a list of 3 matrices).  
SVD({{3, 1, 1}, {-1, 3, 1}}) yields a list containing (  
\left(\begin{array}{rr}-0.71&0.71\0.71&0.71\\\end{array}\right) ), (  
\left(\begin{array}{rr}3.16&0\0&3.46\\\end{array}\right)),  
(\left(\begin{array}{rr}-0.89&0.41\0.45&0.82\0&0.41\\\end{array}\right)).  
This command is also supported in the  
CAS View. The numbers in the answer may vary in order between the  
Algebra View and  
CAS View.  
See also Eigenvalues Command, Eigenvectors Command,  
Invert Command, Transpose Command,  
JordanDiagonalization Command

### TDistribution

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/TDistribution/>

**语法：**

```
TDistribution( <Degrees of Freedom>, <Variable Value> )
TDistribution( <Degrees of Freedom>, <Variable Value>, <Boolean Cumulative> )
TDistribution( <Degrees of Freedom>, x, <Boolean Cumulative> )
```

**说明 / 示例：**

Evaluates the cumulative distribution function of a t-distribution at variable value v, i.e. calculates the  
probability P(X ≤ v) where X is a random variable with a t-distribution with the given degrees of freedom.  
TDistribution(10, 0) yields 0.5.  
This syntax returns the probability at a given value, that is the area under the t-distribution curve to the left of the given x-coordinate.  
If Cumulative = true, evaluates the cumulative distribution function of a t-distribution with given degrees of freedom at the given variable value, otherwise it evaluates the probability density function of the distribution at variable value.  
If Cumulative = true, creates the cumulative density function (cdf) of a t-distribution with given degrees of freedom, otherwise it creates the probability density function (pdf) of the distribution.  
CAS Syntax  
Evaluates the cumulative distribution function of a t-distribution at variable value v, i.e. calculates the  
probability P(X ≤ v) where X is a random variable with a t-distribution with the given degrees of freedom.  
TDistribution(10, 0) yields 0.5.

### Take

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Take/>

**语法：**

```
Take( <List>, <Start Position> )
Take( <Text>, <Start Position> )
Take( <List>, <Start Position>, <End Position> )
Take( <Text>, <Start Position>, <End Position> )
```

**说明 / 示例：**

Returns a list containing the elements from Start Position to the end of the initial list.  
Take({2, 4, 3, 7, 4}, 3) yields {3, 7, 4}.  
Returns a text containing the elements from Start Position to the end of the initial text.  
Take("GeoGebra", 3) yields the text oGebra.  
Returns a list containing the elements from Start Position to End Position of the initial list.  
Take({2, 4, 3, 7, 4}, 3, 4) yields {3, 7}.  
Returns a text containing the elements from Start Position to End Position of the initial text.  
Take("GeoGebra", 3, 6) yields the text oGeb.

### TaylorPolynomial

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/TaylorPolynomial/>

**语法：**

```
TaylorPolynomial( <Function>, <x-Value>, <Order Number> )
TaylorPolynomial( <Expression>, <x-Value>, <Order Number> )
TaylorPolynomial( <Expression>, <Variable>, <Variable Value>, <Order Number> )
```

**说明 / 示例：**

Creates the Taylor series expansion of the given function at the point x-Value up to the given order.  
TaylorPolynomial(x^2, 3, 1) gives 9 + 6 (x - 3), the Taylor series expansion of x2 at x = 3 up to order 1.  
CAS Syntax  
Creates the Taylor series expansion of the given expression at the point x-Value up to the given order.  
TaylorPolynomial(x^2, a, 1) gives a2 + 2a (x - a), the Taylor series expansion of x2 at x = a up to order  
1\.  
Creates the Taylor series expansion of the given expression with respect to the given variable at the point Variable  
Value up to the given order.  
TaylorPolynomial(x^3 sin(y), x, 3, 2) gives 27 sin(y) + 27 sin(y) (x - 3) + 9 sin(y) (x - 3)2, the Taylor  
series expansion with respect to x of x3 sin(y) at x = 3 up to order 2.  
TaylorPolynomial(x^3 sin(y), y, 3, 2) gives x3 sin(3) + x3 cos(3) (y - 3) - x3 (\frac{sin(3) }{2})  
(y - 3)2, the Taylor series expansion with respect to y of x3 sin(y) at y = 3 up to order 2.  
The order has got to be an integer greater or equal to zero.

### ToComplex

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/ToComplex/>

**语法：**

```
ToComplex( <Vector> )
```

**说明 / 示例：**

Transforms a vector or point to a complex number in algebraic form.  
ToComplex((3, 2)) yields 3 + 2ί.  
CAS Syntax  
Transforms a vector or point to a complex number in algebraic form.  
ToComplex((3, 2)) yields 3 + 2ί.  
The complex ί is obtained by pressing ALT + i.  
See also ToExponential Command, ToPoint Command and  
ToPolar Command.

### ToExponential

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/ToExponential/>

**语法：**

```
ToExponential( <Complex Number> )
```

**说明 / 示例：**

CAS Syntax  
Transforms a complex number into its exponential form.  
ToExponential(1 + ί) yields (\sqrt{2}e^{\frac{i\pi}{4}}).  
The complex ί is obtained by pressing ALT + i.  
See also ToPoint Command, ToComplex Command and  
ToPolar Command.

### ToPoint

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/ToPoint/>

**语法：**

```
ToPoint( <Complex Number> )
```

**说明 / 示例：**

Creates a point from the complex number.  
ToPoint(3 + 2ί) creates a point with coordinates (3, 2).  
The complex ί is obtained by pressing ALT + i.  
See also the following commands: ToComplex,  
ToExponential and ToPolar.

### ToPolar

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/ToPolar/>

**语法：**

```
ToPolar( <Vector> )
ToPolar( <Complex Number> )
```

**说明 / 示例：**

Transforms a vector into its polar coordinates.  
ToPolar({1, sqrt(3)}) yields (2; 60°) in the Algebra View and (2; (\frac{\pi}{3})) in the  
CAS View.  
Transforms a complex number into its polar coordinates.  
ToPolar(1 + sqrt(3) * ί) yields (2; 60°) in the Algebra View and (2; (\frac{\pi}{3})) in the  
CAS View.  
The complex ί is obtained by pressing ALT + i.  
See also ToComplex Command, ToExponential Command  
and ToPoint Command.

### Transpose

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Transpose/>

**语法：**

```
Transpose( <Matrix> )
```

**说明 / 示例：**

Transposes the matrix.  
Transpose({{1, 2, 3}, {4, 5, 6}, {7, 8, 9}}) yields the matrix (\begin{pmatrix}1&4&7\ 2&5&8\  
3&6&9\end{pmatrix}).  
CAS Syntax  
Transposes the matrix.  
Transpose({{a, b}, {c, d}}) yields the matrix(\begin{pmatrix}a\&c\b\&d\end{pmatrix}).  
See also Eigenvalues Command, Eigenvectors Command,  
SVD Command, Invert Command,  
JordanDiagonalization Command

### Unique

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Unique/>

**语法：**

```
Unique( <List> )
```

**说明 / 示例：**

Returns list of elements of the given list in ascending order, repetitive elements are included only once. Works for  
both a list of numbers and a list of text.  
Unique({1, 2, 4, 1, 4}) yields {1, 2, 4}.  
Unique({"a", "b", "Hello", "Hello"}) yields {"'Hello", "a", "b"}.  
See also Frequency command.  
CAS Syntax  
Returns a list where each element of the given list occurs only once.  
Unique({1, x, x, 1, a}) yields {1, x, a}.

### UnitPerpendicularVector

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/UnitPerpendicularVector/>

**语法：**

```
UnitPerpendicularVector( <Line>)
UnitPerpendicularVector( <Segment> )
UnitPerpendicularVector( <Vector> )
UnitPerpendicularVector( <Plane> )
```

**说明 / 示例：**

Returns the perpendicular vector with length 1 of the given line.  
UnitPerpendicularVector(3x + 4y = 5) yields (\begin{pmatrix}0.6\0.8\end{pmatrix}).  
Returns the perpendicular vector with length 1 of the given segment.  
Let s = Segment((1,1), (4,5)).  
UnitPerpendicularVector(s) yields (\begin{pmatrix}-0.8\0.6\end{pmatrix}).  
Returns the perpendicular vector with length 1 of the given vector. The vector must be defined first.  
Let v=(\begin{pmatrix}3\4\end{pmatrix}). UnitPerpendicularVector(v) yields  
(\begin{pmatrix}-0.8\0.6\end{pmatrix}).  
CAS Syntax  
In the CAS View vectors with  
undefined variables are also valid input.  
UnitPerpendicularVector((a, b)) yields ((\frac{-b}{\sqrt{a^2 +  
b^2}}),(\frac{a}{\sqrt{a^2+ b^2}})).  
Creates a unit vector orthogonal to the plane.  
See also PerpendicularVector Command.

### UnitVector

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/UnitVector/>

**语法：**

```
UnitVector( <Vector> )
UnitVector( <Line> )
UnitVector( <Segment> )
```

**说明 / 示例：**

Yields a vector with length 1, which has the same direction and orientation as the given vector. The vector must be  
defined first.  
Let v=(\begin{pmatrix}3\4\end{pmatrix}). UnitVector(v) yields  
(\begin{pmatrix}0.6\0.8\end{pmatrix}).  
Yields the direction vector of the given line with length 1.  
UnitVector(3x + 4y = 5) yields (\begin{pmatrix}0.8\\-0.6\end{pmatrix}).  
Yields the direction vector of the given segment with length 1.  
Let s = Segment((1,1),(4,5)).  
UnitVector(s) yields (\begin{pmatrix}0.6\0.8\end{pmatrix}).  
Hint: In the CAS View three-dimensional vectors and vectors with undefined variables  
are also valid inputs.  
UnitVector((a, b)) yields ((\frac{a}{\sqrt{a^2 + b^2}}), (\frac{b}{\sqrt{a^2 + b^2}})).  
UnitVector((2, 4, 4)) yields ((\frac{1}{3}), (\frac{2}{3}), (\frac{2}{3})).

### Variance

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Variance/>

**语法：**

```
Variance( <List of Raw Data> )
Variance( <List of Numbers>, <List of Frequencies> )
Variance( <List of Numbers> )
```

**说明 / 示例：**

Calculates the variance of list elements.  
Variance({1, 2, 3}) yields 0.67.  
Calculates the variance of list elements, considering the frequencies.  
Variance({1, 2, 3} , {1, 2, 1}) yields 0.5.  
CAS Syntax  
Calculates the variance of list elements. If the list contains undefined variables, it yields a formula for the  
variance.  
Variance({1, 2, a}) yields (\frac{2}{9} a^{2} - \frac{2}{3} a + \frac{2}{3}).

### Weibull

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Weibull/>

**语法：**

```
Weibull( <Shape>, <Scale>, <Variable Value> )
Weibull( <Shape>, <Scale>, <Variable Value>, <Boolean Cumulative> )
Weibull( <Shape>, <Scale>, x, <Boolean Cumulative> )
```

**说明 / 示例：**

Evaluates the cumulative distribution function of a Weibull distribution at variable value v, i.e. calculates the  
probability P(X ≤ v) where X is a random variable with a Weibull distribution defined by the given parameters shape and scale.  
Weibull(0.5, 1, 0) yields 0.  
Weibull(0.5, 1, 1) yields (1 - \frac{1} { e } ).  
This syntax returns the probability at a given value, that is the area under the Weibull distribution curve to the left of the given x-coordinate.  
If Cumulative = true, evaluates the cumulative distribution function of a Weibull distribution with given shape and scale at the given variable value, otherwise it evaluates the probability density function of the distribution at variable value.  
If Cumulative = true, creates the cumulative density function (cdf) of a Weibull distribution with given shape and scale, otherwise it creates the probability density function (pdf) of the distribution.

### Zipf

📎 手册页面：<https://geogebra.github.io/docs/manual/en/commands/Zipf/>

**语法：**

```
Zipf( <Number of Elements>, <Exponent> )
Zipf( <Number of Elements>, <Exponent> , <Boolean Cumulative> )
Zipf( <Number of Elements>, <Exponent> , <Variable Value v>, <Boolean Cumulative> )
```

**说明 / 示例：**

Returns a bar graph of a Zipf distribution.  
Parameters:  
Number of Elements: number of elements whose rank we study  
Exponent: exponent characterizing the distribution  
Returns a bar graph of a Zipf distribution when Cumulative = false.  
Returns a graph of a cumulative Zipf distribution when Cumulative = true.  
First two parameters are same as above.  
Let X be a Zipf random variable.  
Returns P( X = v) when Cumulative = false.  
Returns P( X ≤ v) when Cumulative = true.  
First two parameters are same as above.  
Zipf(10, 1 , 5, false) yields 0.07 in the Algebra View and (\frac{504}{7381}) in the  
CAS View.
