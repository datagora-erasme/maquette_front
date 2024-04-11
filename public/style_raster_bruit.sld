<?xml version="1.0" encoding="UTF-8"?>
<StyledLayerDescriptor xmlns="http://www.opengis.net/sld" xmlns:sld="http://www.opengis.net/sld" xmlns:gml="http://www.opengis.net/gml" xmlns:ogc="http://www.opengis.net/ogc" version="1.0.0">
  <UserLayer>
    <sld:LayerFeatureConstraints>
      <sld:FeatureTypeConstraint/>
    </sld:LayerFeatureConstraints>
    <sld:UserStyle>
      <sld:Name>GL_Rte_Lden</sld:Name>
      <sld:FeatureTypeStyle>
        <sld:Rule>
          <sld:RasterSymbolizer>
            <sld:ChannelSelection>
              <sld:GrayChannel>
                <sld:SourceChannelName>1</sld:SourceChannelName>
              </sld:GrayChannel>
            </sld:ChannelSelection>
            <sld:ColorMap type="ramp">
              <sld:ColorMapEntry color="#5fb35b" quantity="45" label="45,0000"/>
              <sld:ColorMapEntry color="#a1ff61" quantity="50" label="50,0000"/>
              <sld:ColorMapEntry color="#cfffaf" quantity="55" label="55,0000"/>
              <sld:ColorMapEntry color="#fffa67" quantity="60" label="60,0000"/>
              <sld:ColorMapEntry color="#ffb042" quantity="65" label="65,0000"/>
              <sld:ColorMapEntry color="#e60000" quantity="70" label="70,0000"/>
              <sld:ColorMapEntry color="#b829b1" quantity="75" label="75,0000"/>
              <sld:ColorMapEntry color="#7c055f" quantity="80" label="80,0000"/>
            </sld:ColorMap>
          </sld:RasterSymbolizer>
        </sld:Rule>
      </sld:FeatureTypeStyle>
    </sld:UserStyle>
  </UserLayer>
</StyledLayerDescriptor>
