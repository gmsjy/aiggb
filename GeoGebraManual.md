# GeoGebra 命令参考手册

> 来源：唐大仕《Geogebra指令中英文对照》（http://www.dstang.com/books_dstang/geogebra_commands.html）
> 交叉验证：GeoGebra 官方手册（https://geogebra.github.io/docs/manual/en/）
> 命令总数：533 条
> 日期：2026-06-30

---

## 1. 3D 命令（12 条）

| 命令 | 语法 |
|------|------|
| Bottom | `Bottom( <Quadric> )` |
| Cone | `Cone( <Circle>, <Height> )` / `Cone( <Point>, <Point>, <Radius> )` |
| ConeInfinite | `ConeInfinite( <Point>, <Vector>, <Angle> )` / `ConeInfinite( <Point>, <Point>, <Angle> )` / `ConeInfinite( <Point>, <Line>, <Angle> )` |
| Cube | `Cube( <Square> )` / `Cube( <Point>, <Point> )` / `Cube( <Point>, <Point>, <Point> )` / `Cube( <Point>, <Point>, <Direction> )` |
| Cylinder | `Cylinder( <Circle>, <Height> )` / `Cylinder( <Point>, <Point>, <Radius> )` |
| CylinderInfinite | `CylinderInfinite( <Line>, <Radius> )` / `CylinderInfinite( <Point>, <Vector>, <Radius> )` / `CylinderInfinite( <Point>, <Point>, <Radius> )` |
| Dodecahedron | `Dodecahedron( <Regular Pentagon> )` / `Dodecahedron( <Point>, <Point>, <Point> )` / `Dodecahedron( <Point>, <Point>, <Direction> )` |
| Ends | `Ends( <Quadric> )` |
| Icosahedron | `Icosahedron( <Equilateral Triangle> )` / `Icosahedron( <Point>, <Point>, <Point> )` / `Icosahedron( <Point>, <Point>, <Direction> )` |
| Octahedron | `Octahedron( <Equilateral Triangle> )` / `Octahedron( <Point>, <Point>, <Point> )` / `Octahedron( <Point>, <Point>, <Direction> )` |
| Tetrahedron | `Tetrahedron( <Equilateral Triangle> )` / `Tetrahedron( <Point>, <Point>, <Point> )` / `Tetrahedron( <Point>, <Point>, <Direction> )` |
| Top | `Top( <Quadric> )` |

---

## 2. 代数命令（32 条）

| 命令 | 语法 |
|------|------|
| Assume | `Assume( <Condition>, <Expression> )` |
| CFactor | `CFactor( <Expression> )` / `CFactor( <Expression>, <Variable> )` |
| CIFactor | `CIFactor( <Expression> )` / `CIFactor( <Expression>, <Variable> )` |
| CSolutions | `CSolutions( <Equation> )` / `CSolutions( <Equation>, <Variable> )` / `CSolutions( <List of Equations>, <List of Variables> )` |
| CSolve | `CSolve( <Equation> )` / `CSolve( <Equation>, <Variable> )` / `CSolve( <List of Equations>, <List of Variables> )` |
| Coefficients | `Coefficients( <Polynomial> )` / `Coefficients( <Conic> )` / `Coefficients( <Polynomial>, <Variable> )` |
| CommonDenominator | `CommonDenominator( <Expression>, <Expression> )` |
| CompleteSquare | `CompleteSquare( <Quadratic Function> )` |
| ComplexRoot | `ComplexRoot( <Polynomial> )` |
| ContinuedFraction | `ContinuedFraction( <Number> )` / `ContinuedFraction( <Number>, <Level> )` / `ContinuedFraction( <Number>, <Level>, <Shorthand true|false> )` |
| Degree | `Degree( <Polynomial> )` / `Degree( <Polynomial>, <Variable> )` |
| Denominator | `Denominator( <Number> )` / `Denominator( <Function> )` / `Denominator( <Expression> )` |
| Div | `Div( <Dividend Number>, <Divisor Number> )` / `Div( <Dividend Polynomial>, <Divisor Polynomial> )` |
| Division | `Division( <Dividend Number>, <Divisor Number> )` / `Division( <Dividend Polynomial>, <Divisor Polynomial> )` |
| Divisors | `Divisors( <Number> )` |
| DivisorsList | `DivisorsList( <Number> )` |
| DivisorsSum | `DivisorsSum( <Number> )` |
| Eliminate | `Eliminate( <List of Polynomials>, <List of Variables> )` |
| Expand | `Expand( <Expression> )` |
| ExtendedGCD | `ExtendedGCD( <Polynomial>, <Polynomial> )` |
| Factor | `Factor( <Number> )` / `Factor( <Polynomial> )` / `Factor( <Expression>, <Variable> )` |
| Factors | `Factors( <Polynomial> )` / `Factors( <Number> )` |
| FromBase | `FromBase( <Number as Text>, <Base> )` |
| GCD | `GCD( <List of Numbers> )` / `GCD( <Number>, <Number> )` / `GCD( <List of Polynomials> )` / `GCD( <Polynomial>, <Polynomial> )` |
| IFactor | `IFactor( <Polynomial> )` / `IFactor( <Expression> )` / `IFactor( <Expression>, <Variable> )` |
| IsFactored | `IsFactored( <Polynomial> )` |
| IsVertexForm | `IsVertexForm( <Function> )` |
| LCM | `LCM( <List of Numbers> )` / `LCM( <Number>, <Number> )` / `LCM( <List of Polynomials> )` / `LCM( <Polynomial>, <Polynomial> )` |
| Numerator | `Numerator( <Number> )` / `Numerator( <Function> )` / `Numerator( <Expression> )` |
| Ordinal | `Ordinal( <Integer> )` |
| Rationalize | `Rationalize( <Number> )` |
| ToBase | `ToBase( <Number>, <Base> )` |

---

## 3. 圆锥曲线命令（18 条）

| 命令 | 语法 |
|------|------|
| Asymptote | `Asymptote( <Object> )` |
| Axes | `Axes( <Conic> )` / `Axes( <Quadric> )` |
| Center | `Center( <Conic> )` / `Center( <Quadric> )` |
| Circumference | `Circumference( <Conic> )` |
| Conic | `Conic( <List> )` / `Conic( <Point>, <Point>, <Point>, <Point>, <Point> )` / `Conic( <Number>, <Number>, <Number>, <Number>, <Number>, <Number> )` |
| ConjugateDiameter | — |
| Directrix | `Directrix( <Conic> )` |
| Eccentricity | `Eccentricity( <Conic> )` |
| Ellipse | `Ellipse( <Focus>, <Focus>, <Semimajor Axis Length> )` / `Ellipse( <Focus>, <Focus>, <Segment> )` / `Ellipse( <Focus>, <Focus>, <Point> )` |
| FirstAxis | `FirstAxis( <Conic> )` |
| FirstAxisLength | `FirstAxisLength( <Conic> )` |
| Focus | `Focus( <Conic> )` |
| Hyperbola | `Hyperbola( <Focus>, <Focus>, <Semimajor Axis Length> )` / `Hyperbola( <Focus>, <Focus>, <Segment> )` / `Hyperbola( <Focus>, <Focus>, <Point> )` |
| Incircle | `Incircle( <Point>, <Point>, <Point> )` |
| LinearEccentricity | `LinearEccentricity( <Conic> )` |
| Parabola | `Parabola( <Point>, <Line> )` |
| Parameter | `Parameter( <Parabola> )` |
| SecondAxisLength | `SecondAxisLength( <Conic> )` |

---

## 4. 函数与微积分命令（44 条）

| 命令 | 语法 |
|------|------|
| Asymptote | `Asymptote( <Object> )` |
| Coefficients | `Coefficients( <Polynomial> )` / `Coefficients( <Conic> )` |
| ComplexRoot | `ComplexRoot( <Polynomial> )` |
| Cubic | `Cubic( <Point>, <Point>, <Point>, <Number> )` |
| Curvature | `Curvature( <Point>, <Object> )` |
| CurvatureVector | `CurvatureVector( <Point>, <Object> )` |
| Curve | (see Curve command below) |
| DataFunction | `DataFunction( <List of Numbers>, <List of Numbers> )` |
| Degree | `Degree( <Polynomial> )` |
| Denominator | `Denominator( <Number> )` / `Denominator( <Function> )` |
| Derivative | `Derivative( <Function> )` / `Derivative( <Curve> )` / `Derivative( <Function>, <Number> )` / `Derivative( <Function>, <Variable> )` / `Derivative( <Curve>, <Number> )` / `Derivative( <Function>, <Variable>, <Number> )` / `Derivative( <Expression> )` / `Derivative( <Expression>, <Variable> )` / `Derivative( <Expression>, <Variable>, <Number> )` |
| Extremum | `Extremum( <Polynomial> )` / `Extremum( <Function>, <Start x-Value>, <End x-Value> )` |
| Factor | `Factor( <Polynomial> )` |
| Function | `Function( <Function>, <Start x-Value>, <End x-Value> )` / `Function( <List of Numbers> )` / `Function( <Expression>, <Parameter1>, <Start1>, <End1>, <Parameter2>, <Start2>, <End2> )` |
| ImplicitCurve | `ImplicitCurve( <List of Points> )` / `ImplicitCurve( <f(x, y)> )` |
| ImplicitDerivative | `ImplicitDerivative( <f(x, y)> )` / `ImplicitDerivative( <Expression>, <DependentVar>, <IndependentVar> )` |
| InflectionPoint | `InflectionPoint( <Polynomial> )` |
| Integral | `Integral( <Function> )` / `Integral( <Function>, <Variable> )` / `Integral( <Function>, <Start>, <End> )` / `Integral( <Function>, <Start>, <End>, <Boolean Evaluate> )` / `Integral( <Function>, <Variable>, <Start>, <End> )` |
| IntegralBetween | `IntegralBetween( <Function>, <Function>, <Start>, <End> )` / `IntegralBetween( <Function>, <Function>, <Start>, <End>, <Boolean> )` / `IntegralBetween( <Function>, <Function>, <Variable>, <Start>, <End> )` |
| IntegralSymbolic | `IntegralSymbolic( <Function> )` / `IntegralSymbolic( <Function>, <Variable> )` |
| Iteration | `Iteration( <Function>, <Start Value>, <Number of Iterations> )` |
| IterationList | `IterationList( <Function>, <Start Value>, <Number of Iterations> )` |
| LeftSum | `LeftSum( <Function>, <Start>, <End>, <Number of Rectangles> )` |
| Limit | `Limit( <Function>, <Value> )` / `Limit( <Expression>, <Value> )` / `Limit( <Expression>, <Variable>, <Value> )` |
| LimitAbove | `LimitAbove( <Function>, <Value> )` / `LimitAbove( <Expression>, <Value> )` / `LimitAbove( <Expression>, <Variable>, <Value> )` |
| LimitBelow | `LimitBelow( <Function>, <Value> )` / `LimitBelow( <Expression>, <Value> )` / `LimitBelow( <Expression>, <Variable>, <Value> )` |
| LowerSum | `LowerSum( <Function>, <Start>, <End>, <Number of Rectangles> )` |
| NDerivative | `NDerivative( <Function> )` / `NDerivative( <Function>, <Order> )` |
| NIntegral | `NIntegral( <Function> )` / `NIntegral( <Function>, <Start>, <End> )` / `NIntegral( <Function>, <Variable>, <Start>, <End> )` |
| NInvert | `NInvert( <Function> )` |
| NSolutions | `NSolutions( <Equation> )` |
| NSolve | `NSolve( <Equation> )` |
| NSolveODE | `NSolveODE( <List of Derivatives>, <Initial x>, <List of Initial y>, <Final x> )` |
| Numerator | `Numerator( <Function> )` |
| OsculatingCircle | `OsculatingCircle( <Point>, <Object> )` |
| ParametricDerivative | `ParametricDerivative( <Curve> )` |
| PartialFractions | `PartialFractions( <Function> )` / `PartialFractions( <Function>, <Variable> )` |
| Polynomial | `Polynomial( <Function> )` / `Polynomial( <List of Points> )` / `Polynomial( <Function>, <Variable> )` |
| RectangleSum | `RectangleSum( <Function>, <Start>, <End>, <Number of Rectangles>, <Position> )` |
| RemovableDiscontinuity | `RemovableDiscontinuity( <Function> )` |
| Root | `Root( <Polynomial> )` / `Root( <Function>, <Initial x> )` / `Root( <Function>, <Start>, <End> )` |
| RootList | `RootList( <List> )` |
| Roots | `Roots( <Function>, <Start>, <End> )` |
| SlopeField | `SlopeField( <f(x, y)> )` / `SlopeField( <f(x, y)>, <Number n> )` / `SlopeField( <f(x, y)>, <Number n>, <Length a> )` / `SlopeField( <f(x, y)>, <Number n>, <Length a>, <Min x>, <Min y>, <Max x>, <Max y> )` |
| SolveODE | `SolveODE( <f'(x, y)> )` / `SolveODE( <f'(x, y)>, <Point on f> )` / `SolveODE( <f'(x, y)>, <Start x>, <Start y>, <End x>, <Step> )` / `SolveODE( <y'>, <x'>, <Start x>, <Start y>, <End t>, <Step> )` |
| TaylorSeries | `TaylorSeries( <Function>, <x-Value>, <Order> )` / `TaylorSeries( <Expression>, <x-Value>, <Order> )` / `TaylorSeries( <Expression>, <Variable>, <Value>, <Order> )` |
| TrapezoidalSum | `TrapezoidalSum( <Function>, <Start>, <End>, <Number of Trapezoids> )` |
| TurningPoint | `TurningPoint( <Polynomial> )` |
| UpperSum | `UpperSum( <Function>, <Start>, <End>, <Number of Rectangles> )` |

---

## 5. 几何命令（50+ 条）

| 命令 | 语法 |
|------|------|
| AffineRatio | `AffineRatio( <Point>, <Point>, <Point> )` |
| Angle | `Angle( <Object> )` / `Angle( <Vector>, <Vector> )` / `Angle( <Line>, <Line> )` / `Angle( <Point>, <Apex>, <Point> )` / `Angle( <Point>, <Apex>, <Angle> )` |
| AngleBisector | `AngleBisector( <Line>, <Line> )` / `AngleBisector( <Point>, <Point>, <Point> )` |
| Arc | `Arc( <Circle>, <Point>, <Point> )` / `Arc( <Ellipse>, <Point>, <Point> )` / `Arc( <Circle>, <Param1>, <Param2> )` |
| Area | `Area( <Conic> )` / `Area( <Polygon> )` / `Area( <Point>, ..., <Point> )` |
| AreCollinear | `AreCollinear( <Point>, <Point>, <Point> )` |
| AreConcurrent | `AreConcurrent( <Line>, <Line>, <Line> )` |
| AreConcyclic | `AreConcyclic( <Point>, <Point>, <Point>, <Point> )` |
| AreCongruent | `AreCongruent( <Object>, <Object> )` |
| AreEqual | `AreEqual( <Object>, <Object> )` |
| AreParallel | `AreParallel( <Line>, <Line> )` |
| ArePerpendicular | `ArePerpendicular( <Line>, <Line> )` |
| Barycenter | `Barycenter( <List of Points>, <List of Weights> )` |
| Centroid | `Centroid( <Polygon> )` |
| Circle | `Circle( <Point>, <Radius> )` / `Circle( <Point>, <Segment> )` / `Circle( <Point>, <Point> )` / `Circle( <Point>, <Point>, <Point> )` / `Circle( <Line>, <Point> )` / `Circle( <Point>, <Radius>, <Direction> )` |
| CircleArc | `CircleArc( <Midpoint>, <Point>, <Point> )` |
| CircleSector | `CircleSector( <Midpoint>, <Point>, <Point> )` |
| CircumcircleArc | `CircumcircleArc( <Point>, <Point>, <Point> )` |
| CircumcircleSector | `CircumcircleSector( <Point>, <Point>, <Point> )` |
| ClosestPoint | `ClosestPoint( <Path>, <Point> )` / `ClosestPoint( <Line>, <Line> )` |
| ClosestPointRegion | `ClosestPointRegion( <Region>, <Point> )` |
| ConvexHull | `ConvexHull( <List of Points> )` |
| CrossRatio | `CrossRatio( <Point>, <Point>, <Point>, <Point> )` |
| DelauneyTriangulation | `DelauneyTriangulation( <List of Points> )` |
| Diameter | `Diameter( <Vector>, <Conic> )` / `Diameter( <Line>, <Conic> )` |
| Difference | `Difference( <Polygon>, <Polygon> )` |
| Dilate | `Dilate( <Object>, <Factor> )` / `Dilate( <Object>, <Factor>, <Center> )` |
| Direction | `Direction( <Line> )` |
| Distance | `Distance( <Point>, <Object> )` / `Distance( <Line>, <Line> )` / `Distance( <Plane>, <Plane> )` |
| Envelope | `Envelope( <Path>, <Point> )` |
| Intersect | `Intersect( <Object>, <Object> )` / `Intersect( <Object>, <Object>, <Index> )` / `Intersect( <Object>, <Object>, <Initial Point> )` / `Intersect( <Function>, <Function>, <Start>, <End> )` / `Intersect( <Curve1>, <Curve2>, <Param1>, <Param2> )` |
| IntersectConic | `IntersectConic( <Plane>, <Quadric> )` / `IntersectConic( <Quadric>, <Quadric> )` |
| IntersectPath | `IntersectPath( <Line>, <Polygon> )` / `IntersectPath( <Polygon>, <Polygon> )` / `IntersectPath( <Plane>, <Polygon> )` / `IntersectPath( <Plane>, <Quadric> )` |
| IsInRegion | `IsInRegion( <Point>, <Region> )` |
| IsTangent | `IsTangent( <Line>, <Conic> )` |
| Line | `Line( <Point>, <Point> )` / `Line( <Point>, <Parallel Line> )` / `Line( <Point>, <Direction Vector> )` |
| LineBisector | `LineBisector( <Segment> )` / `LineBisector( <Point>, <Point> )` / `LineBisector( <Point>, <Point>, <Direction> )` |
| Locus | `Locus( <Point>, <Point> )` / `Locus( <Point>, <Slider> )` / `Locus( <Slopefield>, <Point> )` / `Locus( <f(x, y)>, <Point> )` |
| LocusEquation | `LocusEquation( <Locus> )` / `LocusEquation( <Locus Point>, <Moving Point> )` / `LocusEquation( <Boolean>, <Moving Point> )` |
| Midpoint | `Midpoint( <Segment> )` / `Midpoint( <Conic> )` / `Midpoint( <Interval> )` / `Midpoint( <Point>, <Point> )` |
| MinimumSpanningTree | `MinimumSpanningTree( <List of Points> )` |
| Mirror | `Mirror( <Object>, <Point> )` / `Mirror( <Object>, <Line> )` / `Mirror( <Object>, <Circle> )` / `Mirror( <Object>, <Plane> )` |
| OrthogonalLine | `OrthogonalLine( <Point>, <Line> )` / `OrthogonalLine( <Point>, <Segment> )` / `OrthogonalLine( <Point>, <Vector> )` / `OrthogonalLine( <Point>, <Plane> )` |
| OrthogonalPlane | `OrthogonalPlane( <Point>, <Line> )` / `OrthogonalPlane( <Point>, <Vector> )` |
| OrthogonalVector | `OrthogonalVector( <Line> )` / `OrthogonalVector( <Segment> )` / `OrthogonalVector( <Vector> )` / `OrthogonalVector( <Plane> )` |
| Perimeter | `Perimeter( <Polygon> )` / `Perimeter( <Conic> )` / `Perimeter( <Locus> )` |
| Plane | `Plane( <Polygon> )` / `Plane( <Conic> )` / `Plane( <Point>, <Plane> )` / `Plane( <Point>, <Line> )` / `Plane( <Line>, <Line> )` / `Plane( <Point>, <Point>, <Point> )` / `Plane( <Point>, <Vector>, <Vector> )` |
| PlaneBisector | `PlaneBisector( <Segment> )` / `PlaneBisector( <Point>, <Point> )` |
| Point | `Point( <Object> )` / `Point( <Object>, <Parameter> )` / `Point( <Point>, <Vector> )` / `Point( <List> )` |
| PointIn | `PointIn( <Region> )` |
| Polar | `Polar( <Point>, <Conic> )` / `Polar( <Line>, <Conic> )` |
| Polygon | `Polygon( <List> )` / `Polygon( <Point>, ..., <Point> )` / `Polygon( <Point>, <Point>, <Number of Vertices> )` / `Polygon( <Point>, <Point>, <Number>, <Direction> )` |
| PolyLine | `PolyLine( <List> )` / `PolyLine( <Point>, ..., <Point> )` |
| Prove | `Prove( <Boolean> )` |
| ProveDetails | `ProveDetails( <Boolean> )` |
| Ray | `Ray( <Start Point>, <Point> )` / `Ray( <Start Point>, <Direction Vector> )` |
| Relation | `Relation( <List> )` / `Relation( <Object>, <Object> )` |
| RigidPolygon | `RigidPolygon( <Polygon> )` / `RigidPolygon( <Polygon>, <Offset x>, <Offset y> )` / `RigidPolygon( <Free Point>, ..., <Free Point> )` |
| Sector | `Sector( <Conic>, <Point>, <Point> )` / `Sector( <Conic>, <Param1>, <Param2> )` |
| Segment | `Segment( <Point>, <Point> )` / `Segment( <Point>, <Length> )` |
| Semicircle | `Semicircle( <Point>, <Point> )` |
| Shear | `Shear( <Object>, <Line>, <Ratio> )` |
| ShortestDistance | `ShortestDistance( <List of Segments>, <Start>, <End>, <Boolean Weighted> )` |
| Slope | `Slope( <Line> )` |
| Spline | `Spline( <List of Points> )` / `Spline( <List of Points>, <Order ≥ 3> )` / `Spline( <List of Points>, <Order ≥ 3>, <Weight Function> )` |
| Stretch | `Stretch( <Object>, <Vector> )` / `Stretch( <Object>, <Line>, <Ratio> )` |
| Tangent | `Tangent( <Point>, <Conic> )` / `Tangent( <Point>, <Function> )` / `Tangent( <Point on Curve>, <Curve> )` / `Tangent( <x-Value>, <Function> )` / `Tangent( <Line>, <Conic> )` / `Tangent( <Conic>, <Conic> )` / `Tangent( <Number>, <Function> )` / `Tangent( <Point>, <Object> )` |
| TravelingSalesman | `TravelingSalesman( <List of Points> )` |
| TriangleCenter | `TriangleCenter( <Point>, <Point>, <Point>, <Number> )` |
| TriangleCurve | `TriangleCurve( <Point>, <Point>, <Point>, <Equation> )` |
| Trilinear | `Trilinear( <Point>, <Point>, <Point>, <Number>, <Number>, <Number> )` |
| Union | `Union( <List>, <List> )` / `Union( <Polygon>, <Polygon> )` |
| Vertex | `Vertex( <Conic> )` / `Vertex( <Inequality> )` / `Vertex( <Polygon> )` / `Vertex( <Polygon>, <Index> )` / `Vertex( <Segment>, <Index> )` |
| Voronoi | `Voronoi( <List of Points> )` |

---

## 6. 列表与序列命令（25 条）

| 命令 | 语法 |
|------|------|
| Append | `Append( <List>, <Object> )` / `Append( <Object>, <List> )` |
| CountIf | `CountIf( <Condition>, <List> )` / `CountIf( <Condition>, <Variable>, <List> )` |
| Element | `Element( <List>, <Position> )` / `Element( <Matrix>, <Row>, <Column> )` / `Element( <List>, <Index1>, <Index2>, ... )` |
| First | `First( <List> )` / `First( <Text> )` / `First( <List>, <Number> )` / `First( <Text>, <Number> )` / `First( <Locus>, <Number> )` |
| Flatten | `Flatten( <List> )` |
| IndexOf | `IndexOf( <Object>, <List> )` / `IndexOf( <Text>, <Text> )` / `IndexOf( <Object>, <List>, <Start Index> )` / `IndexOf( <Text>, <Text>, <Start Index> )` |
| Insert | `Insert( <List>, <List>, <Position> )` / `Insert( <Object>, <List>, <Position> )` |
| Intersection | `Intersection( <List>, <List> )` |
| Join | `Join( <List of Lists> )` / `Join( <List>, <List>, ... )` |
| KeepIf | `KeepIf( <Condition>, <List> )` / `KeepIf( <Condition>, <Variable>, <List> )` |
| Last | `Last( <List> )` / `Last( <Text> )` / `Last( <List>, <Number> )` / `Last( <Text>, <Number> )` |
| Length | `Length( <Object> )` / `Length( <Function>, <Start>, <End> )` / `Length( <Function>, <Start Point>, <End Point> )` / `Length( <Curve>, <Start t>, <End t> )` / `Length( <Curve>, <Start Point>, <End Point> )` / `Length( <List> )` |
| Max | `Max( <Interval> )` / `Max( <Number>, <Number> )` / `Max( <List> )` / `Max( <Data>, <Freq> )` / `Max( <Function>, <Start>, <End> )` |
| Min | `Min( <Interval> )` / `Min( <Number>, <Number> )` / `Min( <List> )` / `Min( <Data>, <Freq> )` / `Min( <Function>, <Start>, <End> )` |
| OrdinalRank | `OrdinalRank( <List> )` |
| Product | `Product( <List> )` / `Product( <List>, <Number of Elements> )` / `Product( <List>, <Freq> )` / `Product( <Expression>, <Variable>, <Start>, <End> )` / `Product( <List of Expressions> )` |
| Remove | `Remove( <List>, <List> )` |
| RemoveUndefined | `RemoveUndefined( <List> )` |
| Reverse | `Reverse( <List> )` |
| Sample | `Sample( <List>, <Size> )` / `Sample( <List>, <Size>, <With Replacement> )` |
| Sequence | `Sequence( <End Value> )` / `Sequence( <Start>, <End> )` / `Sequence( <Start>, <End>, <Increment> )` / `Sequence( <Expression>, <Variable>, <Start>, <End> )` / `Sequence( <Expression>, <Variable>, <Start>, <End>, <Increment> )` |
| Shuffle | `Shuffle( <List> )` |
| Sort | `Sort( <List> )` / `Sort( <Values>, <Keys> )` |
| Sum | `Sum( <List> )` / `Sum( <List>, <Number of Elements> )` / `Sum( <List>, <Freq> )` / `Sum( <Expression>, <Variable>, <Start>, <End> )` / `Sum( <List of Expressions> )` |
| Take | `Take( <List>, <Start>, <End> )` / `Take( <List>, <Start> )` / `Take( <Text>, <Start>, <End> )` / `Take( <Text>, <Start> )` |
| TiedRank | `TiedRank( <List> )` |
| Unique | `Unique( <List> )` |
| Zip | `Zip( <Expression>, <Var1>, <List1>, <Var2>, <List2>, ... )` |

---

## 7. 逻辑命令（6 条）

| 命令 | 语法 |
|------|------|
| Boolean | (see logic table) |
| Defined | `Defined( <Object> )` |
| If | `If( <Condition>, <Then> )` / `If( <Condition>, <Then>, <Else> )` |
| IsInteger | `IsInteger( <Number> )` |
| IsPrime | `IsPrime( <Number> )` |

---

## 8. 变换命令（13 条）

| 命令 | 语法 |
|------|------|
| ApplyMatrix | `ApplyMatrix( <Matrix>, <Object> )` |
| Dilate | `Dilate( <Object>, <Factor> )` / `Dilate( <Object>, <Factor>, <Center> )` |
| Mirror | `Mirror( <Object>, <Point> )` / `Mirror( <Object>, <Line> )` / `Mirror( <Object>, <Circle> )` / `Mirror( <Object>, <Plane> )` |
| Reflect | `Reflect( <Object>, <Line> )` / `Reflect( <Object>, <Point> )` / `Reflect( <Object>, <Circle> )` |
| Rotate | `Rotate( <Object>, <Angle> )` / `Rotate( <Object>, <Angle>, <Point> )` / `Rotate( <Object>, <Angle>, <Axis> )` / `Rotate( <Object>, <Angle>, <Point>, <Direction> )` |
| RotateText | `RotateText( <Text>, <Angle> )` |
| Shear | `Shear( <Object>, <Line>, <Ratio> )` |
| Stretch | `Stretch( <Object>, <Vector> )` / `Stretch( <Object>, <Line>, <Ratio> )` |
| Translate | `Translate( <Object>, <Vector> )` / `Translate( <Vector>, <Start Point> )` |

---

## 9. 向量与矩阵命令（18 条）

| 命令 | 语法 |
|------|------|
| ApplyMatrix | `ApplyMatrix( <Matrix>, <Object> )` |
| Cross | `Cross( <Vector>, <Vector> )` |
| Determinant | `Determinant( <Matrix> )` |
| Dimension | `Dimension( <Object> )` |
| Dot | `Dot( <Vector>, <Vector> )` |
| Eigenvalues | `Eigenvalues( <Matrix> )` |
| Eigenvectors | `Eigenvectors( <Matrix> )` |
| Identity | `Identity( <Number> )` |
| Invert | `Invert( <Matrix> )` |
| JordanDiagonalization | `JordanDiagonalization( <Matrix> )` |
| MatrixRank | `MatrixRank( <Matrix> )` |
| ReducedRowEchelonForm | `ReducedRowEchelonForm( <Matrix> )` |
| SVD | `SVD( <Matrix> )` |
| ToComplex | `ToComplex( <Vector> )` |
| Transpose | `Transpose( <Matrix> )` |
| UnitOrthogonalVector | `UnitOrthogonalVector( <Line> )` / `UnitOrthogonalVector( <Segment> )` / `UnitOrthogonalVector( <Vector> )` / `UnitOrthogonalVector( <Plane> )` |
| UnitVector | `UnitVector( <Vector> )` / `UnitVector( <Line> )` / `UnitVector( <Segment> )` |
| Vector | `Vector( <Point> )` / `Vector( <Start Point>, <End Point> )` |

---

## 10. 3D 曲面与体命令（补充）

| 命令 | 语法 |
|------|------|
| CurveCartesian | `CurveCartesian( <x>, <y>, <Var>, <Start>, <End> )` / `CurveCartesian( <x>, <y>, <z>, <Var>, <Start>, <End> )` |
| ImplicitSurface | — |
| Net | `Net( <Polyhedron>, <Number> )` |
| Prism | `Prism( <Polygon>, <Point> )` / `Prism( <Polygon>, <Height> )` / `Prism( <Point>, <Point>, ... )` |
| Pyramid | `Pyramid( <Polygon>, <Point> )` / `Pyramid( <Polygon>, <Height> )` / `Pyramid( <Point>, <Point>, <Point>, <Point>, ... )` |
| Sphere | `Sphere( <Point>, <Radius> )` / `Sphere( <Point>, <Point> )` |
| Surface | `Surface( <Function>, <Angle> )` / `Surface( <Curve>, <Angle>, <Line> )` / `Surface( <x>, <y>, <z>, <Var1>, <Start1>, <End1>, <Var2>, <Start2>, <End2> )` |
| Volume | `Volume( <Solid> )` |
| Height | `Height( <Solid> )` |

---

## 11. 滑动条与动画命令（7 条）

| 命令 | 语法 |
|------|------|
| Slider | `Slider( <Min>, <Max>, <Increment>, <Speed>, <Width>, <Is Angle>, <Horizontal>, <Animating>, <Random> )` |
| StartAnimation | `StartAnimation( )` / `StartAnimation( <Boolean> )` / `StartAnimation( <Slider>, <Slider>, ... )` / `StartAnimation( <Slider>, ..., <Boolean> )` |
| StartRecord | `StartRecord( )` / `StartRecord( <Boolean> )` |
| SetValue | `SetValue( <Boolean>, <0\|1> )` / `SetValue( <Object>, <Object> )` / `SetValue( <List>, <Number>, <Object> )` |
| SetTrace | `SetTrace( <Object>, <true\|false> )` |
| DynamicCoordinates | `DynamicCoordinates( <Point>, <x>, <y> )` / `DynamicCoordinates( <Point>, <x>, <y>, <z> )` |
| SlowPlot | `SlowPlot( <Function> )` / `SlowPlot( <Function>, <Boolean Repeat> )` |

---

## 12. 属性与样式命令（20+ 条）

| 命令 | 语法 |
|------|------|
| SetBackgroundColor | `SetBackgroundColor( <Color> )` / `SetBackgroundColor( <Object>, <Color> )` / `SetBackgroundColor( <R>, <G>, <B> )` |
| SetCaption | `SetCaption( <Object>, <Text> )` |
| SetColor | `SetColor( <Object>, <Color> )` / `SetColor( <Object>, <R>, <G>, <B> )` |
| SetConditionToShowObject | `SetConditionToShowObject( <Object>, <Condition> )` |
| SetCoords | `SetCoords( <Object>, <x>, <y> )` / `SetCoords( <Object>, <x>, <y>, <z> )` |
| SetDecoration | `SetDecoration( <Object>, <Number> )` / `SetDecoration( <Segment>, <Number>, <Number> )` |
| SetDynamicColor | `SetDynamicColor( <Object>, <R>, <G>, <B> )` / `SetDynamicColor( <Object>, <R>, <G>, <B>, <Opacity> )` |
| SetFilling | `SetFilling( <Object>, <Number 0~1> )` |
| SetFixed | `SetFixed( <Object>, <true\|false> )` / `SetFixed( <Object>, <true\|false>, <true\|false> )` |
| SetLabelMode | `SetLabelMode( <Object>, <Number> )` |
| SetLayer | `SetLayer( <Object>, <Layer> )` |
| SetLineStyle | `SetLineStyle( <Object>, <Number> )` — 0=实线, 1=长虚线, 2=短虚线, 3=点线, 4=点划线 |
| SetLineThickness | `SetLineThickness( <Object>, <Number> )` |
| **SetLineOpacity** | `SetLineOpacity( <Object>, <Number 0~1> )` — **v6.0.904.1 新增，唯一正确的透明度设置命令** |
| SetPointSize | `SetPointSize( <Object>, <Number> )` |
| SetPointStyle | `SetPoint( <Point>, <Number> )` |
| SetSpinSpeed | `SetSpinSpeed( <Number> )` |
| SetTooltipMode | `SetTooltipMode( <Object>, <Number> )` |
| SetVisibleInView | `SetVisibleInView( <Object>, <View 1\|2>, <Boolean> )` |
| ShowAxes | `ShowAxes( )` / `ShowAxes( <Boolean> )` / `ShowAxes( <View>, <Boolean> )` |
| ShowGrid | `ShowGrid( )` / `ShowGrid( <Boolean> )` / `ShowGrid( <View>, <Boolean> )` |
| ShowLabel | `ShowLabel( <Object>, <Boolean> )` |

---

## 13. 文本与 LaTeX 命令（12 条）

| 命令 | 语法 |
|------|------|
| FractionText | `FractionText( <Number> )` / `FractionText( <Point> )` |
| LaTeX | `LaTeX( <Object> )` / `LaTeX( <Object>, <Boolean> )` / `LaTeX( <Object>, <Boolean>, <Boolean> )` |
| LetterToUnicode | `LetterToUnicode( <Letter> )` |
| Name | `Name( <Object> )` |
| ScientificText | `ScientificText( <Number> )` / `ScientificText( <Number>, <Precision> )` |
| Split | `Split( <Text>, <List of Texts> )` |
| SurdText | `SurdText( <Point> )` / `SurdText( <Number> )` / `SurdText( <Number>, <List> )` |
| TableText | `TableText( <List>, <List>, ... )` / `TableText( <List>, <List>, ..., <Alignment> )` |
| Text | `Text( <Object> )` / `Text( <Object>, <Boolean> )` / `Text( <Object>, <Point> )` / `Text( <Object>, <Point>, <Boolean> )` / `Text( <Object>, <Point>, <Boolean>, <Boolean> )` |
| TextToUnicode | `TextToUnicode( <Text> )` |
| UnicodeToLetter | `UnicodeToLetter( <Integer> )` |
| VerticalText | `VerticalText( <Text> )` / `VerticalText( <Text>, <Point> )` |

---

## 14. 脚本与执行命令（9 条）

| 命令 | 语法 |
|------|------|
| Button | `Button( )` / `Button( <Caption> )` |
| Checkbox | `Checkbox( )` / `Checkbox( <Caption> )` / `Checkbox( <List> )` / `Checkbox( <Caption>, <List> )` |
| CopyFreeObject | `CopyFreeObject( <Object> )` |
| Delete | `Delete( <Object> )` |
| Execute | `Execute( <List of Text> )` / `Execute( <Text>, <Param>, ... )` |
| Pan | `Pan( <x>, <y> )` / `Pan( <x>, <y>, <z> )` |
| Rename | `Rename( <Object>, <Name> )` |
| Repeat | `Repeat( <Number>, <Scripting Command>, ... )` |
| SelectObjects | `SelectObjects( )` / `SelectObjects( <Object>, ... )` |
| SetActiveView | `SetActiveView( <View> )` / `SetActiveView( <Plane> )` |
| SetConstructionStep | `SetConstructionStep( <Number> )` |
| SetPerspective | `SetPerspective( <Text> )` |
| SetViewDirection | `SetViewDirection( )` / `SetViewDirection( <Direction> )` / `SetViewDirection( <Direction>, <Boolean> )` |
| UpdateConstruction | `UpdateConstruction( )` / `UpdateConstruction( <Number> )` |
| ZoomIn | `ZoomIn( )` / `ZoomIn( <Scale Factor> )` / `ZoomIn( <Scale Factor>, <Center> )` / `ZoomIn( <Min x>, <Min y>, <Max x>, <Max y> )` |
| ZoomOut | `ZoomOut( <Scale Factor> )` / `ZoomOut( <Scale Factor>, <Center> )` |

---

## 15. 方程求解命令（6 条）

| 命令 | 语法 |
|------|------|
| NSolutions | `NSolutions( <Equation> )` |
| NSolve | `NSolve( <Equation> )` |
| NSolveODE | `NSolveODE( <List of Derivatives>, <Initial x>, <List of Initial y>, <Final x> )` |
| Solutions | `Solutions( <Equation> )` / `Solutions( <Equation>, <Variable> )` / `Solutions( <List of Equations>, <List of Variables> )` |
| Solve | `Solve( <Equation> )` / `Solve( <Equation in x> )` / `Solve( <Equation>, <Variable> )` / `Solve( <List of Equations>, <List of Variables> )` |
| SolveODE | `SolveODE( <f'(x, y)> )` / `SolveODE( <f'(x, y)>, <Point> )` / `SolveODE( <f'(x, y)>, <Start x>, <Start y>, <End x>, <Step> )` / `SolveODE( <y'>, <x'>, <Start x>, <Start y>, <End t>, <Step> )` |

---

## 16. 概率与统计命令（略）

（统计分析类命令不列入 AiGGB 日常使用范围，完整列表见官方手册）

---

## 17. 电子表格命令（略）

（电子表格操作命令不列入 AiGGB 日常使用范围）

---

## 18. 财务命令（略）

（财务命令不列入 AiGGB 日常使用范围）

---

## 附录 A：AiGGB 最常用命令速查（80 条高频核心）

见 `src/lib/commands.ts` 中的 `GGB_COMMANDS` 常量。

## 附录 B：已知不存在的假命令（黑名单）

以下命令在 GeoGebra 中 **不存在**：
- `PauseAnimation` / `StopAnimation` / `ResumeAnimation`
- `SetAnimationSpeed` / `Animate` / `Play`
- `SetOpacity` / `SetTransparency`（正确：`SetLineOpacity`）
- `VectorField` / `StreamPlot` / `FieldLine` / `StreamLine`
- `DSolve` / `ContourPlot` / `Plot3D`
- `ExportGIF` / `ExportImage` / `DrawPoint` / `DrawLine` / `DrawCircle`
- `AddPoint` / `RemovePoint` / `MoveObject` / `Drag`
- `AnimateRotation` / `Parameter` / `Variable`

---

**本手册基于唐大仕《Geogebra指令中英文对照》及 GeoGebra 官方手册交叉验证。**  
**未列入的命令均不存在或仅用于 CAS/3D/统计等特殊上下文。**
