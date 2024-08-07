import React, { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import {
  getBrandCollaborationAnalytics,
  getBrandCollaborations,
  getBrandMinimumRequirements,
} from "../../controller/collabrationController";
import { useAlert } from "../../util/AlertContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { formatNumber } from "../../helpers/GraphData";
import { BrandProfileStyles } from "./BrandProfile.scss";
import { getBrandProfile } from "../../controller/brandController";
import BrandProfileBottomBar from "../../components/BrandProfileBottomBar";
import ImageWithFallback from "../../util/ImageWithFallback";
import Loader from "../../shared/Loader";
import { getAllCollabOpenRequests } from "../../controller/collabOpenController";
import { Padding, Color } from "../../GlobalStyles";
import BrandProductCard from "./components/BrandProductCard";
import { useIsFocused } from "@react-navigation/core";

const BrandProfile = ({ route, navigation }) => {
  const clickedId = route?.params?.clickedId;
  const { showAlert } = useAlert();
  const [brandId, setBrandId] = useState(null);
  const [token, setToken] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [minimumRequirements, setMinimumRequirements] = useState(null);
  const [collaborationCount, setCollaborationCount] = useState(0);
  const { width } = useWindowDimensions();
  const [brand, setBrand] = useState(null);
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState(null);
  const isFocused = useIsFocused();
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedBrandId = await AsyncStorage.getItem("brandId");
        const storedToken = await AsyncStorage.getItem("token");

        if (storedBrandId && storedToken) {
          setBrandId(storedBrandId);
          setToken(storedToken);
        } else {
          console.log("BrandId or token not found in AsyncStorage");
        }
      } catch (error) {
        console.error("Error fetching user data from AsyncStorage:", error);
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    if (brandId && token) {
      setLoading(true);

      getAllCollabOpenRequests(brandId, setRequests, showAlert);

      getBrandCollaborationAnalytics(brandId, showAlert)
        .then((data) => setAnalytics(data))
        .catch((error) =>
          console.error("Error fetching collaboration analytics:", error)
        );

      getBrandCollaborations(brandId, showAlert)
        .then((data) => setCollaborationCount(data.length))
        .catch((error) =>
          console.error("Error fetching collaborations:", error)
        );
      getBrandMinimumRequirements(brandId, showAlert)
        .then((data) => setMinimumRequirements(data))
        .catch((error) =>
          console.error("Error fetching minimum requirements:", error)
        );
      if (clickedId)
        getBrandProfile(clickedId, showAlert).then((data) => setBrand(data));
      else getBrandProfile(brandId, showAlert).then((data) => setBrand(data));
      setLoading(false);
    }
  }, [brandId, token, clickedId,isFocused]);

  return (
    <View style={{ width: "100%", height: "100%" }}>
      {loading && <Loader loading={loading} />}
      <ScrollView style={styles.container}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity>
              <View style={styles.headerContent}>
                <Text style={styles.headerTitle}>Brand Profile</Text>
              </View>
            </TouchableOpacity>
            <View style={[styles.profileContainer]}>
              <View style={styles.profileImageContainer}>
                {brand?.profileUrl==null?(
                  <ImageWithFallback
                    imageStyle={styles.profileImage}
                    image={brand?.profileUrl}
                    isSelectedImage={brand?.isSelectedImage}
                  />
                ):brand?.profileUrl&&(
                  <ImageWithFallback
                    imageStyle={styles.profileImage}
                    image={brand?.profileUrl}
                    isSelectedImage={brand?.isSelectedImage}
                  />
                )}
              </View>
              <View style={styles.profileInfoContainer}>
                <Text style={styles.brandName}>{brand?.brandName}</Text>
                <Text style={styles.brandDetails}>
                  {brand?.category || "N/A"}
                </Text>
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.button, styles.followButton]}
                  onPress={() => navigation.navigate("BrandAdminPanel")}
                >
                  <Text style={styles.followButtonText}>Settings</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.messageButton]}
                  onPress={() => navigation.navigate("InboxInterface")}
                >
                  <Text style={styles.buttonText}>inbox</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <View style={[styles.depth1Frame2, styles.depth1FrameSpaceBlock]}>
            <View style={styles.depth2Frame01}>
              <View style={styles.depth3Frame01}>
                <Text style={styles.collaborationRequests}>
                  Collaboration Requests
                </Text>
              </View>
            </View>
          </View>
          {requests && requests.length > 0 ? (
            <View showsVerticalScrollIndicator={false}>
              {requests != null &&
                requests?.map((item, index) => (
                  <BrandProductCard
                    key={index}
                    imageSource={item?.imageSource}
                    isSelectedImage={item?.isSelectedImage}
                    postTitle={item?.postTitle}
                    postDate={item?.postDate}
                    productName={item?.productName}
                    id={item?.requestId}
                    cardWidth="100%"
                    postTitleWidth="auto"
                    postDateWidth="auto"
                    productNameWidth="auto"
                    buttonWidth="auto"
                  />
                ))}
            </View>
          ) : (
            <View style={{ width: "100%", padding: Padding.p_base }}>
              <Text style={{ color: "black" }}>No request found.</Text>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Campaign Insights</Text>
            <View style={styles.insightContainer}>
              <View style={styles.iconBg}>
                <Image
                  style={styles.insightIcon}
                  resizeMode="cover"
                  source={require("../../assets/growth.png")}
                />
              </View>
              <View style={styles.insightDetails}>
                <Text style={styles.insightTitle}>Engagement Rate</Text>
                <Text style={styles.insightText}>Higher than average</Text>
                <Text style={styles.insightText}>
                  {analytics?.averageEngagementRate
                    ? `${analytics?.averageEngagementRate} %`
                    : "N/A"}
                </Text>
              </View>
            </View>
            <View style={styles.insightContainer}>
              <View style={styles.iconBg}>
                <Image
                  style={styles.insightIcon}
                  resizeMode="cover"
                  source={require("../../assets/growth.png")}
                />
              </View>
              <View style={styles.insightDetails}>
                <Text style={styles.insightTitle}>Post Frequency</Text>
                <Text style={styles.insightText}>Average</Text>
                <Text style={styles.insightText}>
                  {analytics?.averagePostFrequency
                    ? `${formatNumber(
                        analytics?.averagePostFrequency
                      )} posts per week`
                    : "N/A"}
                </Text>
              </View>
            </View>
            <View style={styles.insightContainer}>
              <View style={styles.iconBg}>
                <Image
                  style={styles.insightIcon}
                  resizeMode="cover"
                  source={require("../../assets/growth.png")}
                />
              </View>
              <View style={styles.insightDetails}>
                <Text style={styles.insightTitle}>Follower Growth</Text>
                <Text style={styles.insightText}>Higher than average</Text>
                <Text style={styles.insightText}>
                  {analytics?.averageGrowthValue
                    ? `${analytics?.averageGrowthValue} %`
                    : "N/A"}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Collaboration Requirements</Text>
            <View style={styles.requirementContainer}>
              <View style={styles.iconBg}>
                <Image
                  style={styles.requirementIcon}
                  resizeMode="cover"
                  source={require("../../assets/Mini-follower.png")}
                />
              </View>
              <View style={styles.requirementDetails}>
                <Text style={styles.requirementTitle}>Minimum Followers</Text>
                <Text style={styles.requirementText}>
                  {minimumRequirements?.minimumFollowers
                    ? `${formatNumber(minimumRequirements?.minimumFollowers)}`
                    : "N/A"}
                </Text>
              </View>
            </View>
            <View style={styles.requirementContainer}>
              <View style={styles.iconBg}>
                <Image
                  style={styles.requirementIcon}
                  resizeMode="cover"
                  source={require("../../assets/likes.png")}
                />
              </View>
              <View style={styles.requirementDetails}>
                <Text style={styles.requirementTitle}>Average Likes</Text>
                <Text style={styles.requirementText}>
                  {minimumRequirements?.minimumLikes
                    ? `${formatNumber(minimumRequirements?.minimumLikes)}`
                    : "N/A"}
                </Text>
              </View>
            </View>
            <View style={styles.requirementContainer}>
              <View style={styles.iconBg}>
                <Image
                  style={styles.requirementIcon}
                  resizeMode="cover"
                  source={require("../../assets/post-frequency.png")}
                />
              </View>
              <View style={styles.requirementDetails}>
                <Text style={styles.requirementTitle}>Post Frequency</Text>
                <Text style={styles.requirementText}>
                  {minimumRequirements?.minimumPostFrequency
                    ? `At least ${formatNumber(
                        minimumRequirements?.minimumPostFrequency
                      )} posts per week`
                    : "N/A"}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Collaboration Count</Text>
            <View style={styles.collabCountContainer}>
              <View style={styles.iconBg}>
                <Image
                  style={styles.collabIcon}
                  resizeMode="cover"
                  source={require("../../assets/collab_count.png")}
                />
              </View>
              <Text style={styles.collabCount}>
                {collaborationCount
                  ? `${formatNumber(collaborationCount)}`
                  : "N/A"}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
      <BrandProfileBottomBar
        depth5Frame0={require("../../assets/depth-5-frame-01.png")}
        depth5Frame01={require("../../assets/depth-5-frame-02.png")}
        search="Influencer"
        myNetwork={require("../../assets/depth-5-frame-030.png")}
        postImage={require("../../assets/depth-5-frame-029.png")}
        depth5Frame02={require("../../assets/depth-5-frame-03.png")}
        myBrands="Brands"
        depth5Frame03={require("../../assets/depth-5-frame-04.png")}
        style={styles.bottomBar}
      />
    </View>
  );
};

const styles = StyleSheet.create(BrandProfileStyles);

export default BrandProfile;
